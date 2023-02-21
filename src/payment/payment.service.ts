import {
  BadRequestException,
  Injectable,
  NotFoundException,
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
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { RefundDto } from './dto/refund.dto';
import {
  PaymentStatus as OrderPaymentStatus,
  OrderStatus,
} from 'src/order/enum/en.enum';
import { CashierLogService } from 'src/cashier/cashier-log.service';

@Injectable()
export class PaymentService {
  constructor(
    private arbPgService: ArbPgService,
    private transactionService: TransactionService,
    private orderService: OrderService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly cashierLogService: CashierLogService
  ) {}

  async create(
    req: any,
    paymentRequestDetails: PaymentInitiateDto,
  ): Promise<any> {
    const order = await this.orderModel.findById(paymentRequestDetails.orderId);
    if (!order) throw new NotFoundException(`Order is not found`);

    if ([OrderStatus.Closed, OrderStatus.Cancelled].includes(order.status))
      throw new NotFoundException(
        `Payment are not allowed on cancelled or closed orders`,
      );
    let transaction = null;

    let amountToCollect =
      paymentRequestDetails.amount ?? order.summary.totalWithTax;
    if (paymentRequestDetails.transactionId) {
      transaction = await this.transactionModel.findById(
        paymentRequestDetails.transactionId,
      );
      if (!transaction) throw new NotFoundException('Transaction not found');
      if (transaction.status == PaymentStatus.Success)
        throw new NotFoundException('Transaction is already paid');

      amountToCollect = transaction.amount;
    }

    if (order.summary.totalWithTax < order.summary.totalPaid + amountToCollect)
      throw new BadRequestException(
        `This will result in an overpayment. Pending amount to collect is ${
          order.summary.totalWithTax - order.summary.totalPaid
        }`,
      );

    if (!paymentRequestDetails.transactionId) {
      transaction = await this.transactionService.create(req, {
        supplierId: order.supplierId,
        orderId: order._id,
        amount: amountToCollect,
        cashierId: paymentRequestDetails.cashierId,
        paymentGateway:
          paymentRequestDetails.paymentMethod == PaymentMethod.Online
            ? this.arbPgService.config.name
            : null,
        paymentMethod: paymentRequestDetails.paymentMethod,
        status:
          paymentRequestDetails.paymentMethod == PaymentMethod.Online
            ? PaymentStatus.Pending
            : PaymentStatus.Success,
      });

      this.orderService.generalUpdate(req, paymentRequestDetails.orderId, {
        $push: {
          transactions: transaction._id,
        },
      });
    } else {
      transaction.set({
        status:
          paymentRequestDetails.paymentMethod == PaymentMethod.Cash
            ? PaymentStatus.Success
            : PaymentStatus.Pending,
        paymentGateway:
          paymentRequestDetails.paymentMethod == PaymentMethod.Online
            ? this.arbPgService.config.name
            : null,
        paymentMethod: paymentRequestDetails.paymentMethod,
        cashierId: paymentRequestDetails.cashierId,
      });

      await transaction.save();
    }

    if (paymentRequestDetails.paymentMethod == PaymentMethod.Online) {
      const options: PaymentTokenDto = {
        orderId: order._id,
        transactionId: transaction._id,
        amount: transaction.amount,
        action: 1,
        metaId: paymentRequestDetails.metaId,
        redirectUrl: paymentRequestDetails.redirectUrl,
      };
      const res = await this.arbPgService.requestPaymentToken(options);

      this.transactionService.update(transaction._id, {
        externalTransactionId: res.paymentId,
      });
      return res;
    }

    this.transactionService.postTransactionProcess(req, transaction);

    //update cashier log with the respective transaction
    if (paymentRequestDetails.cashierId) {
      this.cashierLogService.logTransactionAsync(paymentRequestDetails.cashierId, transaction.id);
    }

    return true;
  }

  async refund(req: any, dto: RefundDto): Promise<TransactionDocument> {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (dto.amount > order.summary.totalPaid - order.summary.totalRefunded) {
      throw new BadRequestException(
        `Max allowed refund for the given order is ${
          order.summary.totalPaid - order.summary.totalRefunded
        }`,
      );
    }
    const transaction = await this.transactionModel.create({
      supplierId: order.supplierId,
      orderId: order._id,
      cashierId: dto.cashierId,
      amount: dto.amount,
      paymentMethod: PaymentMethod.Cash,
      status: PaymentStatus.Success,
      isRefund: true,
    });
    this.orderService.generalUpdate(req, order._id, {
      $inc: { 'summary.totalRefunded': dto.amount },
      paymentStatus:
        order.summary.totalRefunded + dto.amount == order.summary.totalPaid
          ? OrderPaymentStatus.Refunded
          : OrderPaymentStatus.PartiallyRefunded,
      $push: { transactions: transaction._id },
    });

    if (dto.cashierId) {
      this.cashierLogService.logTransactionAsync(dto.cashierId, transaction._id);
    }
    return transaction;
  }

  async split(req: any, dto: PaymentSplitDto): Promise<TransactionDocument[]> {
    const order = await this.orderModel.findById(dto.orderId);
    if (!order) throw new NotFoundException('Order not found');

    let transactions = await this.transactionModel.find({
      orderId: order._id,
      status: PaymentStatus.Pending,
    });
    if (transactions.length > 0) {
      return transactions;
    }
    const splittedAmount: number =
      (order.summary.totalWithTax - order.summary.totalPaid) / dto.split;

    if (splittedAmount <= 0)
      throw new NotFoundException('Order is already paid');
    const transactionsToSave = [];
    for (let i = 0; i < dto.split; i++) {
      transactionsToSave.push({
        supplierId: order.supplierId,
        orderId: order._id,
        amount: roundOffNumber(splittedAmount),
        paymentGateway: null,
      });
    }

    await this.transactionModel.insertMany(transactionsToSave);
    transactions = await this.transactionModel.find({
      orderId: order._id,
    });
    this.orderService.generalUpdate(req, order._id, {
      $push: {
        transactions: transactions.map((t) => {
          return t._id;
        }),
      },
    });
    return transactions;
  }
}
