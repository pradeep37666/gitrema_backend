import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
  AggregatePaginateModel,
  AggregatePaginateResult,
  Model,
} from 'mongoose';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { PaymentType } from 'src/core/Constants/enum';
import { ReportOrderGeneralDto } from './dto/report-order-general.dto';
import { createReadStream } from 'fs';
import {
  createXlsxFileFromJson,
  DefaultPath,
} from 'src/core/Helpers/excel.helper';
import { Order, OrderDocument } from 'src/order/schemas/order.schema';
import { REPORT_HEADER } from './constants/reports.constant';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Order.name)
    private readonly orderModelAggPag: AggregatePaginateModel<OrderDocument>,
  ) {}

  async populateOrderGeneralReport(
    req: any,
    query: ReportOrderGeneralDto,
    paginateOptions: PaginationDto,
  ): Promise<[AggregatePaginateResult<OrderDocument>, any]> {
    if (query.restaurantId) {
      query.restaurantId = new mongoose.Types.ObjectId(query.restaurantId);
    }

    if (query.startDate && query.endDate) {
      const condition = {
        $and: [
          { createdAt: { $gte: query.startDate } },
          { createdAt: { $lte: query.endDate } },
        ],
      };

      delete query.startDate;
      delete query.endDate;
      query = { ...query, ...condition };
    }

    const orders = await this.orderModelAggPag.aggregatePaginate(
      this.orderModel.aggregate([
        {
          $match: {
            supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
            ...query,
          },
        },
        {
          $lookup: {
            from: 'customers',
            localField: 'customerId',
            foreignField: '_id',
            as: 'customers',
          },
        },
        {
          $addFields: {
            customer: { $first: '$customers' },
          },
        },
        {
          $lookup: {
            from: 'transactions',
            localField: 'transactions',
            foreignField: '_id',
            as: 'transactions',
          },
        },
        {
          $lookup: {
            from: 'restaurants',
            localField: 'restaurantId',
            foreignField: '_id',
            as: 'restaurants',
          },
        },
        {
          $addFields: {
            restaurant: { $first: '$restaurants' },
          },
        },
        {
          $lookup: {
            from: 'tables',
            localField: 'tableId',
            foreignField: '_id',
            as: 'tables',
          },
        },
        {
          $addFields: {
            tables: { $first: '$tables' },
          },
        },
        {
          $addFields: {
            paymentMedium: {
              $map: {
                input: '$transactions',
                as: 'transaction',
                in: {
                  $cond: {
                    if: {
                      $eq: ['$$transaction.paymentMethod', PaymentType.Cash],
                    },
                    then: PaymentType.Cash,
                    else: '$$transaction.pgResponse.cardType',
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            id: { $toString: '$_id' },
            restaurantName: '$restaurant.name',
            restaurantNameAr: '$restaurant.nameAr',
            status: 1,
            createdAt: 1,
            orderType: 1,
            tableName: '$tables.name',
            tableNameAr: '$tables.nameAr',
            paymentStatus: '$paymentStatus',
            paymentMethod: '$paymentMedium',
            couponCode: 1,
            totalOrderAmount: '$summary.totalWithTax',
            refundAmount: '$summary.totalRefunded',
            customerName: '$customer.name',
            customerEmail: '$customer.email',
            customerPhoneNumber: '$customer.phoneNumber',
          },
        },
      ]),
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );

    const summary = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalOrdersAmount: { $sum: '$summary.totalWithTax' },
        },
      },
    ]);

    return [orders, summary];
  }

  async exportOrderGeneralReport(
    req: any,
    query: ReportOrderGeneralDto,
    paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    const orders = await this.populateOrderGeneralReport(
      req,
      query,
      paginateOptions,
    );
    const orderData = orders[0].docs;

    if (!(await createXlsxFileFromJson(orderData, REPORT_HEADER.GENERAL)))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }
}
