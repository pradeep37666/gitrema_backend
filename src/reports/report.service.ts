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
import { PaymentStatus, PaymentType } from 'src/core/Constants/enum';
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
import { ReportReservationDto } from './dto/report-reservation.dto';
import {
  Reservation,
  ReservationDocument,
} from 'src/reservation/schemas/reservation.schema';
import { ReportOrderKitchenDto } from './dto/report-order-kitchen.dto';
import {
  Transaction,
  TransactionDocument,
} from 'src/transaction/schemas/transactions.schema';
import { ReportPaymentDto } from './dto/report-payment.dto';
import { PayoutPreviewDto } from './dto/payout-preview.dto';
import { PaymentMethod } from 'src/payment/enum/en.enum';
import { DELIVERY_MARGIN } from 'src/core/Constants/system.constant';
import { GlobalConfigService } from 'src/global-config/global-config.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Order.name)
    private readonly orderModelAggPag: AggregatePaginateModel<OrderDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModelAggPag: AggregatePaginateModel<ReservationDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModelAggPag: AggregatePaginateModel<TransactionDocument>,
    private globalConfigService: GlobalConfigService,
  ) {}

  async populateOrderGeneralReport(
    req: any,
    query: ReportOrderGeneralDto,
    paginateOptions: PaginationDto,
    isExport = false,
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

    let summary = [];
    if (!isExport) {
      summary = await this.orderModel.aggregate([
        {
          $match: {
            supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          },
        },
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

    if (!(await createXlsxFileFromJson(orderData, 'ORDER_GENERAL')))
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
            lastVisitDate: { $max: '$createdAt' },
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
            lastVisitDate: 1,
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

    if (!(await createXlsxFileFromJson(orderData, 'ORDER_USER')))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async populateOrderLifeCycleReport(
    req: any,
    query: ReportOrderLifeCycleDto,
    paginateOptions: PaginationDto,
    isExport = false,
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
            $addFields: {
              timeToOrder: {
                $divide: [
                  {
                    $subtract: ['$createdAt', '$menuQrCodeScannedTime'],
                  },
                  ONE_MINUTE,
                ],
              },
              fromOrderToKitchen: {
                $divide: [
                  {
                    $subtract: ['$sentToKitchenTime', '$createdAt'],
                  },
                  ONE_MINUTE,
                ],
              },
              fromKitchenToOrderReady: {
                $divide: [
                  {
                    $subtract: ['$orderReadyTime', '$sentToKitchenTime'],
                  },
                  ONE_MINUTE,
                ],
              },
              fromOrderReadyToClose: {
                $divide: [
                  {
                    $subtract: ['$paymentTime', '$orderReadyTime'],
                  },
                  ONE_MINUTE,
                ],
              },
              fromScanToClose: {
                $divide: [
                  {
                    $subtract: ['$paymentTime', '$menuQrCodeScannedTime'],
                  },
                  ONE_MINUTE,
                ],
              },
              fromOrderToClose: {
                $divide: [
                  {
                    $subtract: ['$paymentTime', '$createdAt'],
                  },
                  ONE_MINUTE,
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              restaurantName: '$restaurant.name',
              restaurantNameAr: '$restaurant.nameAr',
              status: 1,
              createdAt: 1,
              orderId: '$_id',
              tableName: '$tables.name',
              tableNameAr: '$tables.nameAr',
              timeToOrder: 1,
              fromOrderToKitchen: 1,
              fromKitchenToOrderReady: 1,
              fromOrderReadyToClose: 1,
              fromScanToClose: 1,
              fromOrderToClose: 1,
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

    let summary = [];
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
          $addFields: {
            timeToOrder: {
              $divide: [
                {
                  $subtract: ['$createdAt', '$menuQrCodeScannedTime'],
                },
                ONE_MINUTE,
              ],
            },
            fromOrderToKitchen: {
              $divide: [
                {
                  $subtract: ['$sentToKitchenTime', '$createdAt'],
                },
                ONE_MINUTE,
              ],
            },
            fromKitchenToOrderReady: {
              $divide: [
                {
                  $subtract: ['$orderReadyTime', '$sentToKitchenTime'],
                },
                ONE_MINUTE,
              ],
            },
            fromOrderReadyToClose: {
              $divide: [
                {
                  $subtract: ['$paymentTime', '$orderReadyTime'],
                },
                ONE_MINUTE,
              ],
            },
            fromScanToClose: {
              $divide: [
                {
                  $subtract: ['$paymentTime', '$menuQrCodeScannedTime'],
                },
                ONE_MINUTE,
              ],
            },
            fromOrderToClose: {
              $divide: [
                {
                  $subtract: ['$paymentTime', '$createdAt'],
                },
                ONE_MINUTE,
              ],
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

    if (!(await createXlsxFileFromJson(orderData, 'ORDER_LIVE_CYCLE')))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async populateReservationReport(
    req: any,
    query: ReportReservationDto,
    paginateOptions: PaginationDto,
    isExport = false,
  ): Promise<[AggregatePaginateResult<ReservationDocument>, any]> {
    if (query.restaurantId) {
      query.restaurantId = new mongoose.Types.ObjectId(query.restaurantId);
    }

    const reservations = await this.reservationModelAggPag.aggregatePaginate(
      this.reservationModel.aggregate(
        [
          // {
          //   $match: {
          //     supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          //     ...query,
          //   },
          // },
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
            $project: {
              restaurantName: '$restaurant.name',
              restaurantNameAr: '$restaurant.nameAr',
              customerName: '$name',
              customerPhoneNumber: '$contactNumber',
              isCancelled: '$isCancelled',
              totalMembers: '$totalMembers',
              date: '$date',
              _id: 0,
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

    let summary = [];
    if (!isExport) {
      summary = await this.reservationModel.aggregate([
        // {
        //   $match: {
        //     supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
        //   },
        // },
        {
          $group: {
            _id: null,
            totalReservations: { $sum: 1 },
            totalReservationsMembers: { $sum: '$totalMembers' },
          },
        },
      ]);
    }

    return [reservations, summary];
  }

  async exportReservationReport(
    req: any,
    query: ReportReservationDto,
    paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    const reservations = await this.populateReservationReport(
      req,
      query,
      paginateOptions,
      true,
    );
    const reservationsData = reservations[0].docs;

    if (!(await createXlsxFileFromJson(reservationsData, 'RESERVATIONS')))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async populateOrderKitchenReport(
    req: any,
    query: ReportOrderKitchenDto,
    paginateOptions: PaginationDto,
    isExport = false,
  ): Promise<[AggregatePaginateResult<OrderDocument>, any]> {
    query.restaurantId = new mongoose.Types.ObjectId(query.restaurantId);

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
              from: 'kitchenqueues',
              localField: 'kitchenQueueId',
              foreignField: '_id',
              as: 'kitchenqueue',
            },
          },
          {
            $addFields: {
              kitchenqueue: { $first: '$kitchenqueue' },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'kitchenqueue.userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $addFields: {
              user: { $first: '$user' },
            },
          },
          {
            $project: {
              _id: 0,
              chef: '$user.name',
              status: '$status',
              createdAt: '$createdAt',
              orderType: '$orderType',
              orderId: '$_id',
              timeToStartPrepare: {
                $divide: [
                  {
                    $subtract: [
                      '$preparationDetails.actualStartTime',
                      '$sentToKitchenTime',
                    ],
                  },
                  ONE_MINUTE,
                ],
              },
              timeFromPrepareToReady: {
                $divide: [
                  {
                    $subtract: [
                      '$preparationDetails.actualEndTime',
                      '$preparationDetails.actualStartTime',
                    ],
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

    let summary = [];
    if (!isExport) {
      summary = await this.populateOrderKitchenSummary(req, query);
    }

    return [orders, summary];
  }

  async populateOrderKitchenSummary(
    req: any,
    query: ReportOrderKitchenDto,
  ): Promise<any> {
    return this.orderModel.aggregate(
      [
        {
          $match: {
            supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
            restaurantId: new mongoose.Types.ObjectId(query.restaurantId),
          },
        },
        {
          $project: {
            _id: 0,
            timeToStartPrepare: {
              $subtract: [
                '$preparationDetails.actualStartTime',
                '$sentToKitchenTime',
              ],
            },
            timeFromPrepareToReady: {
              $subtract: [
                '$preparationDetails.actualEndTime',
                '$preparationDetails.actualStartTime',
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgTimeToStartPrepare: {
              $avg: { $sum: '$timeToStartPrepare' },
            },
            avgTimeFromPrepareToReady: {
              $avg: { $sum: '$timeFromPrepareToReady' },
            },
          },
        },
        {
          $project: {
            _id: 0,
            avgTimeToStartPrepare: {
              $divide: ['$avgTimeToStartPrepare', ONE_MINUTE],
            },
            avgTimeFromPrepareToReady: {
              $divide: ['$avgTimeFromPrepareToReady', ONE_MINUTE],
            },
          },
        },
      ],
      { allowDiskUse: true },
    );
  }

  async exportOrderKitchenReport(
    req: any,
    query: ReportOrderKitchenDto,
    paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    const orders = await this.populateOrderKitchenReport(
      req,
      query,
      paginateOptions,
      true,
    );
    const orderData = orders[0].docs;

    if (!(await createXlsxFileFromJson(orderData, 'ORDER_KITCHEN')))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async populatePaymentRefundReport(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<AggregatePaginateResult<TransactionDocument>> {
    const transactions = await this.transactionModelAggPag.aggregatePaginate(
      this.orderModel.aggregate(
        [
          {
            $match: {
              supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
              isRefund: true,
            },
          },
          {
            $lookup: {
              from: 'orders',
              localField: 'orderId',
              foreignField: '_id',
              as: 'order',
            },
          },
          {
            $addFields: {
              order: { $first: '$order' },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'addedBy',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $addFields: {
              user: { $first: '$user' },
            },
          },
          {
            $project: {
              _id: 0,
              cashierName: '$user.name',
              orderId: '$order._id',
              amount: 1,
              paymentMethod: {
                $cond: {
                  if: {
                    $eq: ['$paymentMethod', PaymentType.Cash],
                  },
                  then: PaymentType.Cash,
                  else: '$pgResponse.cardType',
                },
              },
              status: 1,
              createdAt: 1,
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
    return transactions;
  }

  async exportPaymentRefundReport(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    const transactions = await this.populatePaymentRefundReport(
      req,
      paginateOptions,
    );
    const transactionData = transactions.docs;

    if (!(await createXlsxFileFromJson(transactionData, 'PAYMENT_REFUND')))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async populatePaymentReport(
    req: any,
    query: ReportPaymentDto,
    paginateOptions: PaginationDto,
    isExport = false,
  ): Promise<[AggregatePaginateResult<TransactionDocument>, any]> {
    if (query.cashierId) {
      query.cashierId = new mongoose.Types.ObjectId(query.cashierId);
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

    const transactions = await this.transactionModelAggPag.aggregatePaginate(
      this.orderModel.aggregate(
        [
          {
            $match: {
              supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
              isRefund: false,
              ...query,
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'addedBy',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $addFields: {
              user: { $first: '$user' },
            },
          },
          {
            $project: {
              _id: 0,
              cashierName: '$user.name',
              transferNumber: '$_id',
              amount: 1,
              paymentMethod: {
                $cond: {
                  if: {
                    $eq: ['$paymentMethod', PaymentType.Cash],
                  },
                  then: PaymentType.Cash,
                  else: '$pgResponse.cardType',
                },
              },
              status: 1,
              createdAt: 1,
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

    const summary = [];
    if (!isExport) {
      //summary = await this.populateOrderKitchenSummary(req, query);
    }

    return [transactions, summary];
  }

  async exportPaymentReport(
    req: any,
    query: ReportPaymentDto,
    paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    const transactions = await this.populatePaymentReport(
      req,
      query,
      paginateOptions,
      true,
    );
    const transactionData = transactions[0].docs;

    if (!(await createXlsxFileFromJson(transactionData, 'PAYMENT')))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }

  async exportPayoutPreview(
    req: any,
    query: PayoutPreviewDto,
    isFile = true,
  ): Promise<any[] | StreamableFile> {
    let deliveryMargin = DELIVERY_MARGIN;
    const globalConfig = await this.globalConfigService.fetch();
    if (globalConfig) {
      deliveryMargin = globalConfig?.deliveryMargin ?? DELIVERY_MARGIN;
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
    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          isRefund: false,
          paymentMethod: PaymentMethod.Online,
          //isRemitted: false,
          //isRemitScheduled: true,
          status: PaymentStatus.Success,
          ...query,
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $addFields: {
          supplier: { $first: '$supplier' },
        },
      },
      {
        $lookup: {
          from: 'paymentsetups',
          localField: 'supplierId',
          foreignField: 'supplierId',
          as: 'paymentsetup',
        },
      },
      {
        $addFields: {
          paymentsetup: { $first: '$paymentsetup' },
          // amountTobePaid: {
          //   $subtract: [
          //     '$amount',
          //     {
          //       $divide: [
          //         {
          //           $multiply: ['$amount', deliveryMargin],
          //         },
          //         100,
          //       ],
          //     },
          //   ],
          // },
        },
      },
      {
        $project: {
          amountTobePaid: { $round: ['$payoutAmount', 2] },
          date: {
            $dateToString: { format: '%Y-%m-%d %H:%M', date: '$createdAt' },
          },
          supplierId: '$supplierId',
          supplierName: '$supplier.name',
          amountReceived: '$amount',
          bankId: '$paymentsetup.bankIdCode',
          bankIban: '$paymentsetup.iban',
          bankName: '$paymentsetup.bankName',
          transactionId: '$pgResponse.transId',
          referenceId: '$pgResponse.ref',
          paymentId: '$pgResponse.paymentId',
          ourTransactionId: '$_id',
          scheduledPayoutDate: {
            $dateToString: {
              format: '%Y-%m-%d %H:%M',
              date: '$scheduledPayoutDate',
            },
          },
          paymentMethod: '$pgResponse.cardType',
          settlementStatus: {
            $cond: {
              if: {
                $eq: ['$isRemitted', true],
              },
              then: 'Paid',
              else: 'Not Paid',
            },
          },
        },
      },
    ]);
    if (!isFile) return transactions;
    if (!(await createXlsxFileFromJson(transactions, 'PAYOUT_PREVIEW')))
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }
  async exportPayoutAggregatePreview(
    req: any,
    query: PayoutPreviewDto,
    isFile = true,
  ): Promise<any[] | StreamableFile> {
    let deliveryMargin = DELIVERY_MARGIN;
    const globalConfig = await this.globalConfigService.fetch();
    if (globalConfig) {
      deliveryMargin = globalConfig?.deliveryMargin ?? DELIVERY_MARGIN;
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
    const transactions = await this.transactionModel.aggregate([
      {
        $match: {
          isRefund: false,
          paymentMethod: PaymentMethod.Online,
          isRemitted: false,
          //isRemitScheduled: true,
          status: PaymentStatus.Success,
          ...query,
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      {
        $addFields: {
          supplier: { $first: '$supplier' },
        },
      },
      {
        $lookup: {
          from: 'paymentsetups',
          localField: 'supplierId',
          foreignField: 'supplierId',
          as: 'paymentsetup',
        },
      },
      {
        $addFields: {
          paymentsetup: { $first: '$paymentsetup' },
          // amountTobePaid: {
          //   $subtract: [
          //     '$amount',
          //     {
          //       $divide: [
          //         {
          //           $multiply: ['$amount', deliveryMargin],
          //         },
          //         100,
          //       ],
          //     },
          //   ],
          // },
        },
      },
      {
        $group: {
          _id: {
            supplierId: '$supplierId',
            scheduledPayoutDate: '$scheduledPayoutDate',
          },
          amountTobePaid: { $sum: { $round: ['$payoutAmount', 2] } },
          amountReceived: { $sum: { $round: ['$amount', 2] } },
          supplierId: { $first: '$supplierId' },
          supplierName: { $first: '$supplier.name' },
          bankId: { $first: '$paymentsetup.bankIdCode' },
          bankIban: { $first: '$paymentsetup.iban' },
          bankName: { $first: '$paymentsetup.bankName' },
          scheduledPayoutDate: {
            $first: {
              $dateToString: {
                format: '%Y-%m-%d %H:%M',
                date: '$scheduledPayoutDate',
              },
            },
          },
        },
      },
    ]);

    if (!isFile) return transactions;
    if (
      !(await createXlsxFileFromJson(transactions, 'PAYOUT_AGGREGATED_PREVIEW'))
    )
      throw new NotFoundException();

    const file = createReadStream(DefaultPath);
    return new StreamableFile(file);
  }
}
