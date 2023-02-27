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
import { ONE_MINUTE, REPORT_HEADER } from './constants/reports.constant';
import { ReportOrderUserDto } from './dto/report-order-user.dto';
import { ReportOrderLifeCycleDto } from './dto/report-order-live-cycle.dto';

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
    isExport: boolean = false,
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

    let summary;
    if (!isExport) {
      summary = await this.orderModel.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalOrdersAmount: { $sum: '$summary.totalWithTax' },
          },
        },
      ]);
    }
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
      true,
    );
    const orderData = orders[0].docs;

    if (!(await createXlsxFileFromJson(orderData, REPORT_HEADER.ORDER_GENERAL)))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async populateOrderUserReport(
    req: any,
    query: ReportOrderUserDto,
    paginateOptions: PaginationDto,
  ): Promise<AggregatePaginateResult<OrderDocument>> {
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
          $group: {
            _id: {
              restaurantName: '$restaurant.name',
              restaurantNameAr: '$restaurant.nameAr',
              customerName: '$customer.name',
              customerPhoneNumber: '$customer.phoneNumber',
            },
            orderType: { $addToSet: '$orderType' },
            visitCount: { $sum: 1 },
          },
        },
        {
          $project: {
            restaurantName: '$_id.restaurantName',
            restaurantNameAr: '$_id.restaurantNameAr',
            customerName: '$_id.customerName',
            customerPhoneNumber: '$_id.customerPhoneNumber',
            orderType: 1,
            visitCount: 1,
            _id: 0,
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

    return orders;
  }

  async exportOrderUserReport(
    req: any,
    query: ReportOrderUserDto,
    paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    const orders = await this.populateOrderUserReport(
      req,
      query,
      paginateOptions,
    );
    const orderData = orders.docs;

    if (!(await createXlsxFileFromJson(orderData, REPORT_HEADER.ORDER_USER)))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async populateOrderLifeCycleReport(
    req: any,
    query: ReportOrderLifeCycleDto,
    paginateOptions: PaginationDto,
    isExport: boolean = false,
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
      this.orderModel.aggregate(
        [
          {
            $match: {
              supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
              ...query,
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
            $lookup: {
              from: 'activities',
              let: {
                id: '$_id',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$dataId', '$$id'],
                    },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    MenuScannedDateTime: {
                      $cond: {
                        if: { $eq: ['MenuScanned', '$data.activityType'] },
                        then: '$data.date',
                        else: '$$REMOVE',
                      },
                    },
                    OrderPlacedDateTime: {
                      $cond: {
                        if: { $eq: ['OrderPlaced', '$data.activityType'] },
                        then: '$data.date',
                        else: '$$REMOVE',
                      },
                    },
                    SentToKitchenDateTime: {
                      $cond: {
                        if: { $eq: ['SentToKitchen', '$data.activityType'] },
                        then: '$data.date',
                        else: '$$REMOVE',
                      },
                    },
                    OrderReadyDateTime: {
                      $cond: {
                        if: { $eq: ['OrderReady', '$data.activityType'] },
                        then: '$data.date',
                        else: '$$REMOVE',
                      },
                    },
                  },
                },
              ],
              as: 'orderStatusChangeTimings',
            },
          },
          {
            $group: {
              _id: {
                restaurantName: '$restaurant.name',
                restaurantNameAr: '$restaurant.nameAr',
                status: '$status',
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',
                tableName: '$tables.name',
                tableNameAr: '$tables.nameAr',
                orderId: '$_id',
                timings: { $mergeObjects: '$orderStatusChangeTimings' },
              },
            },
          },
          {
            $project: {
              restaurantName: '$_id.restaurantName',
              restaurantNameAr: '$_id.restaurantNameAr',
              status: '$_id.status',
              createdAt: '$_id.createdAt',
              updatedAt: '$_id.updatedAt',
              tableName: '$_id.tableName',
              tableNameAr: '$_id.tableNameAr',
              orderId: '$_id.orderId',
              timings: '$_id.timings',
              _id: 0,
            },
          },
          {
            $addFields: {
              timeToOrder: {
                $divide: [
                  {
                    $subtract: [
                      '$timings.OrderPlacedDateTime',
                      '$timings.MenuScannedDateTime',
                    ],
                  },
                  ONE_MINUTE,
                ],
              },
              fromOrderToKitchen: {
                $divide: [
                  {
                    $subtract: [
                      '$timings.SentToKitchenDateTime',
                      '$timings.OrderPlacedDateTime',
                    ],
                  },
                  ONE_MINUTE,
                ],
              },
              fromKitchenToOrderReady: {
                $divide: [
                  {
                    $subtract: [
                      '$timings.OrderReadyDateTime',
                      '$timings.SentToKitchenDateTime',
                    ],
                  },
                  ONE_MINUTE,
                ],
              },
              fromOrderReadyToClose: {
                $divide: [
                  {
                    $subtract: ['$updatedAt', '$timings.OrderReadyDateTime'],
                  },
                  ONE_MINUTE,
                ],
              },
              fromScanToClose: {
                $divide: [
                  {
                    $subtract: ['$updatedAt', '$timings.MenuScannedDateTime'],
                  },
                  ONE_MINUTE,
                ],
              },
              fromOrderToClose: {
                $divide: [
                  {
                    $subtract: ['$updatedAt', '$timings.OrderPlacedDateTime'],
                  },
                  ONE_MINUTE,
                ],
              },
            },
          },
        ],
        { allowDiskUse: true },
      ),
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );

    let summary;
    if (!isExport) {
      summary = await this.populateOrderLifeCycleSummary(req);
    }

    return [orders, summary];
  }

  async populateOrderLifeCycleSummary(req: any): Promise<any> {
    return this.orderModel.aggregate(
      [
        {
          $match: {
            supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          },
        },
        {
          $lookup: {
            from: 'activities',
            let: {
              id: '$_id',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$dataId', '$$id'],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  MenuScannedDateTime: {
                    $cond: {
                      if: { $eq: ['MenuScanned', '$data.activityType'] },
                      then: '$data.date',
                      else: '$$REMOVE',
                    },
                  },
                  OrderPlacedDateTime: {
                    $cond: {
                      if: { $eq: ['OrderPlaced', '$data.activityType'] },
                      then: '$data.date',
                      else: '$$REMOVE',
                    },
                  },
                  SentToKitchenDateTime: {
                    $cond: {
                      if: { $eq: ['SentToKitchen', '$data.activityType'] },
                      then: '$data.date',
                      else: '$$REMOVE',
                    },
                  },
                  OrderReadyDateTime: {
                    $cond: {
                      if: { $eq: ['OrderReady', '$data.activityType'] },
                      then: '$data.date',
                      else: '$$REMOVE',
                    },
                  },
                },
              },
            ],
            as: 'orderStatusChangeTimings',
          },
        },
        {
          $group: {
            _id: {
              orderId: '$_id',
              timings: { $mergeObjects: '$orderStatusChangeTimings' },
            },
          },
        },
        {
          $project: {
            orderId: '$_id.orderId',
            timings: '$_id.timings',
            _id: 0,
          },
        },
        {
          $addFields: {
            timeToOrder: {
              $subtract: [
                '$timings.OrderPlacedDateTime',
                '$timings.MenuScannedDateTime',
              ],
            },
            fromOrderToKitchen: {
              $subtract: [
                '$timings.SentToKitchenDateTime',
                '$timings.OrderPlacedDateTime',
              ],
            },
            fromKitchenToOrderReady: {
              $subtract: [
                '$timings.OrderReadyDateTime',
                '$timings.SentToKitchenDateTime',
              ],
            },
            fromOrderReadyToClose: {
              $subtract: ['$updatedAt', '$timings.OrderReadyDateTime'],
            },
            fromScanToClose: {
              $subtract: ['$updatedAt', '$timings.MenuScannedDateTime'],
            },
            fromOrderToClose: {
              $subtract: ['$updatedAt', '$timings.OrderPlacedDateTime'],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgTimeToOrder: {
              $avg: { $sum: '$timeToOrder' },
            },
            avgFromOrderToKitchen: {
              $avg: { $sum: '$fromOrderToKitchen' },
            },
            avgFromKitchenToOrderReady: {
              $avg: { $sum: '$fromKitchenToOrderReady' },
            },
            avgFromOrderReadyToClose: {
              $avg: { $sum: '$fromOrderReadyToClose' },
            },
            avgFromScanToClose: {
              $avg: { $sum: '$fromScanToClose' },
            },
            avgFromOrderToClose: {
              $avg: { $sum: '$fromOrderToClose' },
            },
          },
        },
        {
          $project: {
            _id: 0,
            avgTimeToOrder: {
              $divide: ['$avgTimeToOrder', ONE_MINUTE],
            },
            avgFromOrderToKitchen: {
              $divide: ['$avgFromOrderToKitchen', ONE_MINUTE],
            },
            avgFromKitchenToOrderReady: {
              $divide: ['$avgFromKitchenToOrderReady', ONE_MINUTE],
            },
            avgFromOrderReadyToClose: {
              $divide: ['$avgFromOrderReadyToClose', ONE_MINUTE],
            },
            avgFromScanToClose: {
              $divide: ['$avgFromScanToClose', ONE_MINUTE],
            },
            avgFromOrderToClose: {
              $divide: ['$avgFromOrderToClose', ONE_MINUTE],
            },
          },
        },
      ],
      { allowDiskUse: true },
    );
  }

  async exportOrderLifeCycleReport(
    req: any,
    query: ReportOrderLifeCycleDto,
    paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    const orders = await this.populateOrderLifeCycleReport(
      req,
      query,
      paginateOptions,
      true,
    );
    const orderData = orders[0].docs;

    if (
      !(await createXlsxFileFromJson(orderData, REPORT_HEADER.ORDER_LIVE_CYCLE))
    )
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }
}
