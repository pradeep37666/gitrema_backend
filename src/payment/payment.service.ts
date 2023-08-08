import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { ReservationService } from '../reservation/reservation.service';
import { PaymentInitiateDto, PaymentSplitDto } from './dto/payment.dto';
import {
  ArbPgService,
  PaymentTokenDto,
} from 'src/core/Providers/PaymentsGateways/arb-pg.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { OrderService } from 'src/order/order.service';
import { PaymentMethod } from './enum/en.enum';
import {
  Transaction,
  TransactionDocument,
} from 'src/transaction/schemas/transactions.schema';
import { PaymentStatus } from 'src/core/Constants/enum';
import { findDay, roundOffNumber } from 'src/core/Helpers/universal.helper';
import { RefundDto } from './dto/refund.dto';
import { OrderPaymentStatus, OrderStatus } from 'src/order/enum/en.enum';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { Cashier, CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { CashierLogService } from 'src/cashier/cashier-log.service';
import { CashierHelperService } from 'src/cashier/cashier-helper.service';
import { PaymentSetupService } from 'src/payment-setup/payment-setup.service';
import { SupplierService } from 'src/supplier/Supplier.service';
import { GlobalConfigService } from 'src/global-config/global-config.service';
import * as moment from 'moment';

import { v4 as uuidv4 } from 'uuid';

import {
  DELIVERY_MARGIN,
  PAYOUT_DAY,
  TIMEZONE,
} from 'src/core/Constants/system.constant';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { PaymentGatewayService } from 'src/payment-gateway/payment-gateway.service';
import { ClickPayService } from 'src/core/Providers/PaymentsGateways/click-pay.service';
import { PaymentGateways } from 'src/payment-gateway/enum/en';

@Injectable()
export class PaymentService {
  constructor(
    private arbPgService: ArbPgService,
    private transactionService: TransactionService,
    private orderService: OrderService,
    private cashierLogService: CashierLogService,
    private cashierHelpderService: CashierHelperService,
    private paymentSetupService: PaymentSetupService,
    @Inject(forwardRef(() => SupplierService))
    private supplierService: SupplierService,
    private globalConfigService: GlobalConfigService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Cashier.name)
    private readonly cashierModel: Model<CashierDocument>,

    private socketGateway: SocketIoGateway,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly clickpayService: ClickPayService,
  ) {}

  async create(
    req: any,
    paymentRequestDetails: PaymentInitiateDto,
  ): Promise<any> {
    const order = await this.orderModel.findById(paymentRequestDetails.orderId);
    if (!order)
      throw new NotFoundException(VALIDATION_MESSAGES.RecordNotFound.key);

    if (
      [
        OrderStatus.Closed,
        OrderStatus.Cancelled,
        OrderStatus.CancelledByMerge,
        OrderStatus.CancelledWihPaymentFailed,
      ].includes(order.status)
    )
      throw new NotFoundException(
        `Payment are not allowed on cancelled or closed orders`,
      );
    let transaction = null;

    let amountToCollect =
      paymentRequestDetails.amount ??
      order.summary.totalWithTax +
        (order.tip ?? 0) -
        (order.summary.totalPaid ?? 0);
    if (paymentRequestDetails.transactionId) {
      transaction = await this.transactionModel.findById(
        paymentRequestDetails.transactionId,
      );
      if (!transaction) throw new NotFoundException('Transaction not found');
      if (transaction.status == PaymentStatus.Success)
        throw new NotFoundException('Transaction is already paid');

      amountToCollect = transaction.amount;
    }

    if (
      order.summary.totalWithTax + (order.tip ?? 0) <
      order.summary.totalPaid + amountToCollect
    )
      throw new BadRequestException(
        `${VALIDATION_MESSAGES.OverPayment.key}__${
          order.summary.totalWithTax - order.summary.totalPaid
        }`,
      );
    // identify cashierId
    const cashierId = await this.cashierHelpderService.resolveCashierId(
      req,
      paymentRequestDetails.cashierId,
      true,
      order.restaurantId,
    );
    let paymentGateway = null;
    if (paymentRequestDetails.paymentMethod == PaymentMethod.Online)
      paymentGateway = this.arbPgService.config.name;
    else if (paymentRequestDetails.paymentMethod == PaymentMethod.POS)
      paymentGateway = 'Near Pay';
    if (!paymentRequestDetails.transactionId) {
      transaction = await this.transactionService.create(req, {
        supplierId: order.supplierId,
        orderId: order._id,
        amount: amountToCollect,
        paymentGateway,
        paymentMethod: paymentRequestDetails.paymentMethod,
        status: [PaymentMethod.Cash, PaymentMethod.Card].includes(
          paymentRequestDetails.paymentMethod,
        )
          ? PaymentStatus.Success
          : PaymentStatus.Pending,
        cashierId,
        uuId: uuidv4(),
      });

      let paymentStatus = {};
      if (
        order.paymentStatus == OrderPaymentStatus.NotPaid &&
        paymentRequestDetails.paymentMethod == PaymentMethod.Online
      ) {
        paymentStatus = { paymentStatus: OrderPaymentStatus.Pending };
      }
      this.orderService.generalUpdate(req, paymentRequestDetails.orderId, {
        $push: {
          transactions: transaction._id,
        },
        ...paymentStatus,
      });
    } else {
      transaction.set({
        status: [PaymentMethod.Cash, PaymentMethod.Card].includes(
          paymentRequestDetails.paymentMethod,
        )
          ? PaymentStatus.Success
          : PaymentStatus.Pending,
        paymentGateway,
        paymentMethod: paymentRequestDetails.paymentMethod,
      });

      await transaction.save();
    }

    //save transaction to cashier
    this.cashierLogService.logTransactionAsync(cashierId, transaction._id);

    if (paymentRequestDetails.paymentMethod == PaymentMethod.Online) {
      const globalConfig = await this.globalConfigService.fetch();
      const supplier = await this.supplierService.getOne(
        order.supplierId.toString(),
      );
      const paymentGateway = await this.paymentGatewayService.findOneBySupplier(
        order.supplierId.toString(),
      );
      let res = null,
        dataToUpdate: any = {};
      if (globalConfig.paymentGateway == PaymentGateways.Clickpay) {
        await this.clickpayService.init(paymentGateway);
        res = await this.clickpayService.requestPaymentToken({
          transactionId: transaction._id.toString(),
          amount: transaction.amount,
          redirect: paymentRequestDetails.redirectUrl,
        });
        dataToUpdate = {
          externalTransactionId: res.paymentId,
          paymentGatewayDetails: {
            paymentGatewayId: paymentGateway?._id ?? null,
          },
          paymentGateway: PaymentGateways.Clickpay,
        };
      } else {
        await this.arbPgService.init(paymentGateway);
        const options: PaymentTokenDto = {
          orderId: order._id,
          transactionId: transaction._id,
          amount: transaction.amount,
          action: 1,
          metaId: paymentRequestDetails.metaId,
          redirectUrl: paymentRequestDetails.redirectUrl,
          accountDetails: await this.preparePayout(
            supplier,
            transaction.amount,
          ),
        };
        res = await this.arbPgService.requestPaymentToken(options);

        dataToUpdate = {
          externalTransactionId: res.paymentId,
          paymentGatewayDetails: {
            paymentGatewayId: paymentGateway?._id ?? null,
            terminalName:
              paymentGateway?.credentials.terminalName ?? 'TalabatMenu',
          },
        };
        if (options.accountDetails && options.accountDetails.length > 0) {
          dataToUpdate.isRemitScheduled = true;

          dataToUpdate.scheduledPayoutDate = new Date(
            moment
              .utc(options.accountDetails[0].valueDate)
              .format('YYYY-MM-DD'),
          );
          dataToUpdate.payoutAmount = options.accountDetails[0].serviceAmount;
        }
      }
      this.transactionService.update(transaction._id, dataToUpdate);
      return res;
    }
    if (
      [PaymentMethod.Cash, PaymentMethod.Card].includes(
        paymentRequestDetails.paymentMethod,
      )
    )
      this.transactionService.postTransactionProcess(req, transaction);

    if (paymentRequestDetails.paymentMethod == PaymentMethod.POS) {
      this.socketGateway.emit(
        transaction.supplierId.toString(),
        SocketEvents.PosLaunched,
        transaction,
      );
    }

    return transaction;
  }

  async refund(req: any, dto: RefundDto): Promise<TransactionDocument> {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order)
      throw new NotFoundException(VALIDATION_MESSAGES.RecordNotFound.key);
    if (dto.amount > order.summary.totalPaid - order.summary.totalRefunded) {
      throw new BadRequestException(
        `Max allowed refund for the given order is ${
          order.summary.totalPaid - order.summary.totalRefunded
        }`,
      );
    }
    // identify cashierId
    const cashierId = await this.cashierHelpderService.resolveCashierId(
      req,
      dto.cashierId,
      true,
      order.restaurantId,
    );
    const transaction = await this.transactionModel.create({
      supplierId: order.supplierId,
      orderId: order._id,
      amount: dto.amount,
      paymentMethod: PaymentMethod.Cash,
      status: PaymentStatus.Success,
      isRefund: true,
      cashierId,
      addedBy: req ? req.user.userId : null,
    });

    // save transaction to cashier
    this.cashierLogService.logTransactionAsync(cashierId, transaction._id);

    this.transactionService.postTransactionProcess(req, transaction);

    return transaction;
  }

  async split(req: any, dto: PaymentSplitDto): Promise<TransactionDocument[]> {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order)
      throw new NotFoundException(VALIDATION_MESSAGES.RecordNotFound.key);

    let transactions = await this.transactionModel.find({
      orderId: order._id,
      status: PaymentStatus.Pending,
    });
    if (transactions.length > 0) {
      return transactions;
    }
    let amountToCollect =
      order.summary.totalWithTax - order.summary.totalPaid + (order.tip ?? 0);
    let splittedAmount: number = roundOffNumber(amountToCollect / dto.split);

    if (splittedAmount <= 0)
      throw new NotFoundException('Order is already paid');
    const transactionsToSave = [];
    for (let i = 0; i < dto.split; i++) {
      amountToCollect -= splittedAmount;
      if (i == dto.split - 1 && amountToCollect > 0) {
        splittedAmount += amountToCollect;
        splittedAmount = roundOffNumber(splittedAmount);
      }
      transactionsToSave.push({
        supplierId: order.supplierId,
        orderId: order._id,
        amount: splittedAmount,
        paymentGateway: null,
        addedBy: req.user.userId,
      });
    }

    await this.transactionModel.insertMany(transactionsToSave);
    transactions = await this.transactionModel.find({
      orderId: order._id,
    });
    // store transaction to order
    this.orderService.generalUpdate(req, order._id, {
      $push: {
        transactions: transactions.map((t) => {
          return t._id;
        }),
      },
    });

    return transactions;
  }
  async preparePayout(
    supplier: SupplierDocument,
    amount: number,
  ): Promise<
    [
      {
        bankIdCode: string;
        iBanNum: string;
        benificiaryName: string;
        serviceAmount: number;
        valueDate: string;
      },
    ]
  > {
    let accountDetails = null;
    const paymentSetup = await this.paymentSetupService.findOneBySupplier(
      supplier._id,
    );
    if (
      paymentSetup &&
      paymentSetup.bankIdCode &&
      paymentSetup.iban &&
      paymentSetup.bankAccountHolder
    ) {
      const supplierPackage =
        await this.supplierService.getSupplierActivePackage(supplier._id);
      let deliveryMargin = DELIVERY_MARGIN;
      let payoutDay = PAYOUT_DAY;
      if (supplierPackage && supplierPackage.deliveryMargin) {
        deliveryMargin = supplierPackage.deliveryMargin;
      } else {
        const globalConfig = await this.globalConfigService.fetch();
        if (globalConfig) {
          deliveryMargin = globalConfig?.deliveryMargin ?? DELIVERY_MARGIN;
          payoutDay = globalConfig.payoutDay ?? PAYOUT_DAY;
        }
      }

      const deliveryMarginAmount = roundOffNumber(
        (amount * deliveryMargin) / 100,
      );
      accountDetails = [
        {
          bankIdCode: paymentSetup.bankIdCode,
          iBanNum: paymentSetup.iban,
          benificiaryName: paymentSetup.bankAccountHolder,
          serviceAmount: amount - deliveryMarginAmount,
          valueDate: findDay(payoutDay, supplier.timezone ?? TIMEZONE).format(
            'YYYY-MM-DD',
          ),
        },
      ];
    }
    return accountDetails;
  }
}
