import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LeanDocument, Model, PaginateModel, PaginateResult } from 'mongoose';

import { TransactionQueryDto } from './transaction.dto';

import {
  Transaction,
  TransactionDocument,
} from './schemas/transactions.schema';
import { PaymentStatus, PaymentTarget } from 'src/core/Constants/enum';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { OrderHelperService } from 'src/order/order-helper.service';
import {
  OrderActivityType,
  OrderStatus,
  OrderPaymentStatus,
} from 'src/order/enum/en.enum';
import { capitalize } from 'src/core/Helpers/universal.helper';
import { TableLog, TableLogDocument } from 'src/table/schemas/table-log.schema';

import { CashierLogService } from 'src/cashier/cashier-log.service';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { OrderService } from 'src/order/order.service';
import { TableHelperService } from 'src/table/table-helper.service';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @InjectModel(Transaction.name)
    private transactionModelPag: PaginateModel<TransactionDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(TableLog.name)
    private readonly tableLogModel: Model<TableLogDocument>,
    private orderHelperService: OrderHelperService,
    private orderService: OrderService,
    private cashierLogService: CashierLogService,
    private tableHelperService: TableHelperService,
  ) {}

  async create(req: any, transactionDetail: any): Promise<TransactionDocument> {
    return await this.transactionModel.create({
      ...transactionDetail,
      supplierId: req.type != PaymentTarget.Spn ? req.user.supplierId : null,
      addedBy: req.user.userId,
    });
  }

  async get(transactionId: string): Promise<LeanDocument<TransactionDocument>> {
    const transaction = await this.transactionModel.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }

    return transaction;
  }

  async update(
    transactionId: string,
    transactionDetail: any,
  ): Promise<LeanDocument<TransactionDocument>> {
    const transaction = await this.transactionModel
      .findByIdAndUpdate(transactionId, transactionDetail, { new: true })
      .lean();
    if (!transaction) {
      throw new NotFoundException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }
    return transaction;
  }

  async all(
    req: any,
    query: TransactionQueryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<TransactionDocument>> {
    return await this.transactionModelPag.paginate(
      { ...query },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'supplierId',
            select: { name: 1, nameAr: 1 },
            match: { deletedAt: null },
          },
          {
            path: 'orderId',
            // select: { reservationNumber: 1 },
          },
        ],
      },
    );
  }

  async postTransactionProcess(
    req: any,
    transaction: LeanDocument<TransactionDocument>,
  ): Promise<void> {
    if (transaction.status == PaymentStatus.Success) {
      const order = await this.orderModel.findById(transaction.orderId);
      // save activity
      this.orderHelperService.storeOrderStateActivity(
        order,
        transaction.isRefund
          ? OrderActivityType.Refunded
          : OrderActivityType.PaymentReceived,
        new Date(),
      );

      // log the transaction in cashier
      this.cashierLogService.storeCurrentBalance(
        transaction.cashierId,
        transaction,
      );

      if (transaction.isRefund) {
        this.orderService.generalUpdate(req, order._id, {
          $inc: { 'summary.totalRefunded': transaction.amount },
          paymentStatus:
            order.summary.totalRefunded + transaction.amount ==
            order.summary.totalPaid
              ? OrderPaymentStatus.Refunded
              : OrderPaymentStatus.PartiallyRefunded,
          $push: { transactions: transaction._id },
        });
      } else {
        const result = await this.transactionModel.aggregate([
          {
            $match: {
              orderId: transaction.orderId,
              status: PaymentStatus.Success,
              isRefund: false,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ]);
        if (result && result.length == 1) {
          const total = result[0].total;
          const dataToUpdate: any = {
            'summary.totalPaid': total,
          };
          if (total >= order.summary.totalWithTax) {
            dataToUpdate.status = OrderStatus.New
              ? OrderStatus.SentToKitchen
              : OrderStatus.Closed;
            dataToUpdate.paymentStatus = OrderPaymentStatus.Paid;
            dataToUpdate.paymentTime = new Date();
          }
          order.set(dataToUpdate);
          await order.save();
          this.orderHelperService.postOrderUpdate(order, dataToUpdate);

          // update table log
          if (order.tableId) {
            this.tableHelperService.handlePaymentNeeded(
              order.tableId.toString(),
            );
          }
        }
      }
    }
  }
}
