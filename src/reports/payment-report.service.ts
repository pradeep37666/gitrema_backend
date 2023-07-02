import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import {
  SalesReportDto,
  SalesTrendReportDailyDto,
} from './dto/sales-report.dto';
import {
  Transaction,
  TransactionDocument,
} from 'src/transaction/schemas/transactions.schema';
import { PaymentMethod } from 'src/payment/enum/en.enum';
import { OrderPaymentStatus } from 'src/order/enum/en.enum';
import { PaymentStatus } from 'src/core/Constants/enum';
import * as moment from 'moment';
import { TIMEZONE } from 'src/core/Constants/system.constant';
import {
  Supplier,
  SupplierDocument,
} from '../supplier/schemas/suppliers.schema';

@Injectable()
export class PaymentReportService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async paymentByPaymentMethod(req, dto: SalesReportDto) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    if (dto.restaurantIds && dto.restaurantIds.length > 0)
      queryToApply.restaurantId = {
        $in: dto.restaurantIds.map((r) => new mongoose.Types.ObjectId(r)),
      };
    if (dto.startDate && dto.endDate) {
      dto.startDate.setUTCHours(0);
      dto.startDate.setUTCMinutes(0);
      dto.startDate = new Date(
        dto.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      dto.endDate.setUTCHours(23);
      dto.endDate.setUTCMinutes(60);
      dto.endDate = new Date(
        dto.endDate.toLocaleString('en', { timeZone: timezone }),
      );

      queryToApply.createdAt = {
        $gte: dto.startDate,
        $lte: dto.endDate,
      };
    }
    const records = await this.transactionModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          status: PaymentStatus.Success,
        },
      },
      {
        $project: {
          paymentAmount: '$amount',
          paymentMethod: '$paymentMethod',
          refundAmount: {
            $cond: [
              {
                $eq: ['$isRefund', true],
              },
              '$amount',
              0,
            ],
          },
          totalPayments: {
            $cond: [
              {
                $eq: ['$isRefund', false],
              },
              1,
              0,
            ],
          },
          totalRefunds: {
            $cond: [
              {
                $eq: ['$isRefund', true],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          paymentAmount: { $sum: '$paymentAmount' },
          refundAmount: { $sum: '$refundAmount' },
          totalPayments: { $sum: '$totalPayments' },
          totalRefunds: { $sum: '$totalRefunds' },
        },
      },
    ]);

    return records;
  }
}
