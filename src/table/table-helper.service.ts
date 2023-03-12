import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Table, TableDocument } from './schemas/table.schema';
import mongoose, { Model } from 'mongoose';

import { TableLog, TableLogDocument } from './schemas/table-log.schema';

import { Order, OrderDocument } from 'src/order/schemas/order.schema';

import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { TableStatus } from './enum/en.enum';

@Injectable()
export class TableHelperService {
  constructor(
    @InjectModel(TableLog.name)
    private readonly tableLogModel: Model<TableLogDocument>,
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private socketGateway: SocketIoGateway,
  ) {}

  async handlePaymentNeeded(tableId: string, tableLog = null) {
    if (!tableLog) {
      tableLog = await this.tableLogModel.findOne({
        tableId,
        closingTime: null,
      });
    }
    if (tableLog) {
      const result = await this.orderModel.aggregate([
        {
          $match: {
            _id: { $in: tableLog.orders },
          },
        },
        {
          $group: {
            _id: null,
            totalPaid: { $sum: '$summary.totalPaid' },
            total: { $sum: '$summary.totalWithTax' },
          },
        },
      ]);
      console.log(result);
      tableLog.paymentNeeded = false;
      if (result && result.length == 1) {
        if (result[0].totalPaid < result[0].total) {
          tableLog.paymentNeeded = true;
        }
      }
      tableLog.save();
      this.socketGateway.emit(
        tableLog.supplierId.toString(),
        SocketEvents.TableLog,
        tableLog.toObject(),
      );
    }
  }

  async handleTableTransfer(order: OrderDocument, sourceTableId) {
    if (sourceTableId) {
      const sourceTableLog = await this.tableLogModel.findOneAndUpdate(
        {
          tableId: sourceTableId,
          closingTime: null,
        },
        {
          $pull: { orders: order._id },
        },
        {
          new: true,
        },
      );
      console.log('Source Table Log', sourceTableLog);
      this.handlePaymentNeeded(sourceTableId, sourceTableLog);
    }

    await this.addOrderToTableLogWithAutoStart(order);
  }

  async addOrderToTableLogWithAutoStart(order: OrderDocument) {
    const tableLog = await this.tableLogModel.findOneAndUpdate(
      { tableId: order.tableId, closingTime: null },
      {
        $push: { orders: order._id },
        supplierId: order.supplierId,
        restaurantId: order.restaurantId,
      },
      {
        upsert: true,
        setDefaultsOnInsert: true,
        new: true,
      },
    );
    this.handlePaymentNeeded(tableLog.tableId.toString(), tableLog);

    await this.tableModel.findByIdAndUpdate(order.tableId, {
      status: TableStatus.InUse,
      currentTableLog: tableLog._id,
    });

    return tableLog;
  }
}
