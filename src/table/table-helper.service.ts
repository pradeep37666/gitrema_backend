import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Table, TableDocument } from './schemas/table.schema';
import mongoose, { Model } from 'mongoose';

import { TableLog, TableLogDocument } from './schemas/table-log.schema';

import { Order, OrderDocument } from 'src/order/schemas/order.schema';

import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { SocketEvents } from 'src/socket-io/enum/events.enum';

@Injectable()
export class TableHelperService {
  constructor(
    @InjectModel(TableLog.name)
    private readonly tableLogModel: Model<TableLogDocument>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private socketGateway: SocketIoGateway,
  ) {}

  async handlePaymentNeeded(tableId: string) {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          tableId: new mongoose.Types.ObjectId(tableId),
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
    if (result && result.length == 1) {
      if (result[0].totalPaid >= result[0].total) {
        const tableLog = await this.tableLogModel.findOneAndUpdate(
          { tableId: tableId, closingTime: null },
          { paymentNeeded: false },
          { new: true },
        );
        this.socketGateway.emit(
          tableLog.supplierId.toString(),
          SocketEvents.TableLog,
          tableLog.toObject(),
        );
      }
    }
  }
}
