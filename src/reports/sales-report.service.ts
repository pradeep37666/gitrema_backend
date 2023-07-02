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
export class SalesReportService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async salesSummary(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const order = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },
      {
        $lookup: {
          from: 'transactions',
          let: {
            transactions: '$transactions',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$transactions'],
                },
                status: PaymentStatus.Success,
              },
            },
            {
              $project: {
                total: '$amount',
                cash: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Cash] },
                    '$amount',
                    0,
                  ],
                },
                card: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Card] },
                    '$amount',
                    0,
                  ],
                },
                hungerStation: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.HungerStation] },
                    '$amount',
                    0,
                  ],
                },
                jahez: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Jahez] },
                    '$amount',
                    0,
                  ],
                },
                toyo: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Toyo] },
                    '$amount',
                    0,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalPayment: { $sum: '$total' },
                cash: { $sum: '$cash' },
                card: { $sum: '$card' },
                hungerStation: { $sum: '$hungerStation' },
                jahez: { $sum: '$jahez' },
                toyo: { $sum: '$toyo' },
              },
            },
          ],
          as: 'transactions',
        },
      },
      {
        $project: {
          transactions: { $first: '$transactions' },
          summary: 1,
          tip: 1,
        },
      },
      {
        $group: {
          _id: null,
          grossSales: { $sum: '$summary.totalBeforeDiscount' },
          discounts: { $sum: '$summary.discount' },
          netSales: { $sum: '$summary.totalTaxableAmount' },
          tax: {
            $sum: '$summary.totalTax',
          },
          tip: {
            $sum: '$tip',
          },
          refunds: { $sum: '$summary.totalRefunded' },
          totalSales: { $sum: '$summary.totalWithTax' },
          totalPayment: { $sum: '$transactions.totalPayment' },
          cash: { $sum: '$transactions.cash' },
          card: { $sum: '$transactions.card' },
          hungerStation: { $sum: '$transactions.hungerStation' },
          jahez: { $sum: '$transactions.jahez' },
          toyo: { $sum: '$transactions.toyo' },
        },
      },
    ]);

    return {
      ...order[0],
    };
  }
  async salesSummaryHourlyData(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const order = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },
      {
        $lookup: {
          from: 'transactions',
          let: {
            transactions: '$transactions',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$_id', '$$transactions'],
                },
                status: PaymentStatus.Success,
              },
            },
            {
              $project: {
                total: '$amount',
                cash: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Cash] },
                    '$amount',
                    0,
                  ],
                },
                card: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Card] },
                    '$amount',
                    0,
                  ],
                },
                hungerStation: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.HungerStation] },
                    '$amount',
                    0,
                  ],
                },
                jahez: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Jahez] },
                    '$amount',
                    0,
                  ],
                },
                toyo: {
                  $cond: [
                    { $eq: ['$paymentMethod', PaymentMethod.Toyo] },
                    '$amount',
                    0,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalPayment: { $sum: '$total' },
                cash: { $sum: '$cash' },
                card: { $sum: '$card' },
                hungerStation: { $sum: '$hungerStation' },
                jahez: { $sum: '$jahez' },
                toyo: { $sum: '$toyo' },
              },
            },
          ],
          as: 'transactions',
        },
      },
      {
        $project: {
          transactions: { $first: '$transactions' },
          summary: 1,
          tip: 1,
          y: { $year: { date: '$createdAt', timezone } },
          m: { $month: { date: '$createdAt', timezone } },
          d: { $dayOfMonth: { date: '$createdAt', timezone } },
          h: { $hour: { date: '$createdAt', timezone } },
        },
      },
      {
        $group: {
          _id: { year: '$y', month: '$m', day: '$d', hour: '$h' },
          grossSales: { $sum: '$summary.totalBeforeDiscount' },
          discounts: { $sum: '$summary.discount' },
          netSales: { $sum: '$summary.totalTaxableAmount' },
          tax: {
            $sum: '$summary.totalTax',
          },
          tip: {
            $sum: '$tip',
          },
          refunds: { $sum: '$summary.totalRefunded' },
          totalSales: { $sum: '$summary.totalWithTax' },
          totalPayment: { $sum: '$transactions.totalPayment' },
          cash: { $sum: '$transactions.cash' },
          card: { $sum: '$transactions.card' },
          hungerStation: { $sum: '$transactions.hungerStation' },
          jahez: { $sum: '$transactions.jahez' },
          toyo: { $sum: '$transactions.toyo' },
        },
      },
    ]);

    return order;
  }
  async dailySalesTrend(req, dto: SalesTrendReportDailyDto) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    if (dto.restaurantIds && dto.restaurantIds.length > 0)
      queryToApply.restaurantId = {
        $in: dto.restaurantIds.map((r) => new mongoose.Types.ObjectId(r)),
      };
    if (dto.startDate) {
      dto.startDate.setUTCHours(0);
      dto.startDate.setUTCMinutes(0);
      dto.startDate = new Date(
        dto.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      const endDate = dto.startDate;
      endDate.setUTCHours(23);
      endDate.setUTCMinutes(60);

      queryToApply.createdAt = {
        $gte: dto.startDate,
        $lte: endDate,
      };
    }
    console.log(queryToApply);
    const order = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },

      {
        $project: {
          summary: 1,
          tip: 1,
          y: { $year: { date: '$createdAt', timezone } },
          m: { $month: { date: '$createdAt', timezone } },
          d: { $dayOfMonth: { date: '$createdAt', timezone } },
          h: { $hour: { date: '$createdAt', timezone } },
        },
      },
      {
        $group: {
          _id: { year: '$y', month: '$m', day: '$d', hour: '$h' },

          totalSales: { $sum: '$summary.totalWithTax' },
        },
      },
    ]);

    return order;
  }
  async weeklySalesTrend(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const order = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },

      {
        $project: {
          summary: 1,
          tip: 1,
          y: { $year: { date: '$createdAt', timezone } },
          m: { $month: { date: '$createdAt', timezone } },
          d: { $dayOfMonth: { date: '$createdAt', timezone } },
          weekDay: { $dayOfWeek: { date: '$createdAt', timezone } },
        },
      },
      {
        $group: {
          _id: { year: '$y', month: '$m', day: '$d', weekDay: '$weekDay' },
          totalSales: { $sum: '$summary.totalWithTax' },
        },
      },
    ]);

    return order;
  }

  async yearlySalesTrend(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const order = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },

      {
        $project: {
          summary: 1,
          tip: 1,
          y: { $year: { date: '$createdAt', timezone } },
          m: { $month: { date: '$createdAt', timezone } },
        },
      },
      {
        $group: {
          _id: { year: '$y', month: '$m' },

          totalSales: { $sum: '$summary.totalWithTax' },
        },
      },
    ]);

    return order;
  }

  async itemSaleReport(req, dto: SalesTrendReportDailyDto) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    if (dto.restaurantIds && dto.restaurantIds.length > 0)
      queryToApply.restaurantId = {
        $in: dto.restaurantIds.map((r) => new mongoose.Types.ObjectId(r)),
      };
    if (dto.startDate) {
      dto.startDate.setUTCHours(0);
      dto.startDate.setUTCMinutes(0);
      dto.startDate = new Date(
        dto.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      const endDate = dto.startDate;
      endDate.setUTCHours(23);
      endDate.setUTCMinutes(60);

      queryToApply.createdAt = {
        $gte: dto.startDate,
        $lte: endDate,
      };
    }
    console.log(queryToApply);
    const records = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },

      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem.menuItemId',
          foreignField: '_id',
          as: 'items.menuItemObj',
        },
      },
      {
        $lookup: {
          from: 'menucategories',
          localField: 'items.menuItemObj.categoryId',
          foreignField: '_id',
          as: 'items.category',
        },
      },

      {
        $lookup: {
          from: 'unitofmeasures',
          localField: 'items.menuItem.uomSell',
          foreignField: '_id',
          as: 'items.uom',
        },
      },
      {
        $addFields: {
          'items.category': {
            $first: '$items.category',
          },
        },
      },

      {
        $group: {
          _id: '$items.menuItem.menuItemId',
          name: { $first: '$items.menuItem.name' },
          nameAr: { $first: '$items.menuItem.nameAr' },
          quantitiesSold: { $sum: '$items.quantity' },
          grossAmount: { $sum: '$items.amountBeforeDiscount' },
          discount: { $sum: '$items.discount' },
          amountAfterDiscount: { $sum: '$items.amountAfterDiscount' },
          tax: { $sum: '$items.tax' },
          category: { $first: '$items.category.name' },
          categoryAr: { $first: '$items.category.nameAr' },
          uom: { $first: '$items.uom.name' },
        },
      },
    ]);
    return records;
  }

  async itemSaleHourlyReport(req, dto: SalesTrendReportDailyDto) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    if (dto.restaurantIds && dto.restaurantIds.length > 0)
      queryToApply.restaurantId = {
        $in: dto.restaurantIds.map((r) => new mongoose.Types.ObjectId(r)),
      };
    if (dto.startDate) {
      dto.startDate.setUTCHours(0);
      dto.startDate.setUTCMinutes(0);
      dto.startDate = new Date(
        dto.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      const endDate = dto.startDate;
      endDate.setUTCHours(23);
      endDate.setUTCMinutes(60);

      queryToApply.createdAt = {
        $gte: dto.startDate,
        $lte: endDate,
      };
    }
    console.log(queryToApply);
    const records = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },

      { $unwind: '$items' },
      {
        $project: {
          items: 1,
          y: { $year: { date: '$createdAt', timezone } },
          m: { $month: { date: '$createdAt', timezone } },
          d: { $dayOfMonth: { date: '$createdAt', timezone } },
          h: { $hour: { date: '$createdAt', timezone } },
        },
      },

      {
        $group: {
          _id: {
            item: '$items.menuItem.menuItemId',
            year: '$y',
            month: '$m',
            day: '$d',
            hour: '$h',
          },
          name: { $first: '$items.menuItem.name' },
          nameAr: { $first: '$items.menuItem.nameAr' },
          quantitiesSold: { $sum: '$items.quantity' },
          grossAmount: { $sum: '$items.amountAfterDiscount' },
        },
      },
    ]);
    return records;
  }

  async categorySaleReport(req, dto: SalesTrendReportDailyDto) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    if (dto.restaurantIds && dto.restaurantIds.length > 0)
      queryToApply.restaurantId = {
        $in: dto.restaurantIds.map((r) => new mongoose.Types.ObjectId(r)),
      };
    if (dto.startDate) {
      dto.startDate.setUTCHours(0);
      dto.startDate.setUTCMinutes(0);
      dto.startDate = new Date(
        dto.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      const endDate = dto.startDate;
      endDate.setUTCHours(23);
      endDate.setUTCMinutes(60);

      queryToApply.createdAt = {
        $gte: dto.startDate,
        $lte: endDate,
      };
    }
    console.log(queryToApply);
    const records = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },

      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem.menuItemId',
          foreignField: '_id',
          as: 'items.menuItemObj',
        },
      },
      {
        $lookup: {
          from: 'menucategories',
          localField: 'items.menuItemObj.categoryId',
          foreignField: '_id',
          as: 'items.category',
        },
      },
      {
        $addFields: {
          'items.category': {
            $first: '$items.category',
          },
        },
      },

      {
        $group: {
          _id: '$items.category._id',
          quantitiesSold: { $sum: '$items.quantity' },
          grossAmount: { $sum: '$items.amountBeforeDiscount' },
          discount: { $sum: '$items.discount' },
          amountAfterDiscount: { $sum: '$items.amountAfterDiscount' },
          tax: { $sum: '$items.tax' },
          category: { $first: '$items.category.name' },
          categoryAr: { $first: '$items.category.nameAr' },
        },
      },
    ]);
    return records;
  }

  async categorySaleHourlyReport(req, dto: SalesTrendReportDailyDto) {
    const supplier = await this.supplierModel.findById(req.user.supplierId);
    const timezone = supplier?.timezone ?? TIMEZONE;
    let queryToApply: any = {};
    if (dto.restaurantIds && dto.restaurantIds.length > 0)
      queryToApply.restaurantId = {
        $in: dto.restaurantIds.map((r) => new mongoose.Types.ObjectId(r)),
      };
    if (dto.startDate) {
      dto.startDate.setUTCHours(0);
      dto.startDate.setUTCMinutes(0);
      dto.startDate = new Date(
        dto.startDate.toLocaleString('en', { timeZone: timezone }),
      );
      const endDate = dto.startDate;
      endDate.setUTCHours(23);
      endDate.setUTCMinutes(60);

      queryToApply.createdAt = {
        $gte: dto.startDate,
        $lte: endDate,
      };
    }
    console.log(queryToApply);
    const records = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },

      { $unwind: '$items' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.menuItem.menuItemId',
          foreignField: '_id',
          as: 'items.menuItemObj',
        },
      },
      {
        $lookup: {
          from: 'menucategories',
          localField: 'items.menuItemObj.categoryId',
          foreignField: '_id',
          as: 'items.category',
        },
      },
      {
        $addFields: {
          'items.category': {
            $first: '$items.category',
          },
        },
      },

      {
        $project: {
          items: 1,
          y: { $year: { date: '$createdAt', timezone } },
          m: { $month: { date: '$createdAt', timezone } },
          d: { $dayOfMonth: { date: '$createdAt', timezone } },
          h: { $hour: { date: '$createdAt', timezone } },
        },
      },

      {
        $group: {
          _id: {
            item: '$items.category._id',
            year: '$y',
            month: '$m',
            day: '$d',
            hour: '$h',
          },
          category: { $first: '$items.category.name' },
          categoryAr: { $first: '$items.category.nameAr' },
          quantitiesSold: { $sum: '$items.quantity' },
          grossAmount: { $sum: '$items.amountAfterDiscount' },
        },
      },
    ]);
    return records;
  }

  async additionSaleReport(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const records = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
          'items.additions': {
            $ne: [],
          },
        },
      },

      { $unwind: '$items' },

      {
        $group: {
          _id: {
            item: '$items.menuItem.menuItemId',
            addition: '$items.additions.menuAdditionId',
          },
          quantitiesSold: { $sum: '$items.quantity' },
          grossAmount: { $sum: '$items.amountBeforeDiscount' },
          discount: { $sum: '$items.discount' },
          amountAfterDiscount: { $sum: '$items.amountAfterDiscount' },
          tax: { $sum: '$items.tax' },
          name: { $first: '$items.menuItem.name' },
          nameAr: { $first: '$items.menuItem.nameAr' },
          addition: { $first: '$items.additions.name' },
          additionAr: { $first: '$items.additions.nameAr' },
        },
      },
    ]);
    return records;
  }

  async teamSalesReport(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'waiterId',
          foreignField: '_id',
          as: 'waiter',
        },
      },
      {
        $project: {
          waiterId: 1,
          waiter: 1,
          summary: 1,
          tip: 1,
        },
      },
      {
        $addFields: {
          waiter: {
            $first: '$waiter',
          },
        },
      },
      {
        $group: {
          _id: '$waiterId',
          waiter: { $first: '$waiter.name' },
          totalSales: { $sum: '$summary.totalWithTax' },
          refunds: { $sum: '$summary.totalRefunded' },
        },
      },
    ]);

    return orders;
  }

  async discountSalesReport(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
          $and: [
            {
              couponCode: { $ne: null },
            },
            {
              couponCode: { $ne: '' },
            },
          ],
        },
      },
      {
        $group: {
          _id: '$couponCode',
          totalSales: { $sum: '$summary.totalWithTax' },
          refunds: { $sum: '$summary.totalRefunded' },
        },
      },
    ]);

    return orders;
  }

  async salesTaxReport(req, dto: SalesReportDto) {
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
    console.log(queryToApply);
    const orders = await this.orderModel.aggregate([
      {
        $match: {
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          ...queryToApply,
          paymentStatus: {
            $nin: [OrderPaymentStatus.NotPaid, OrderPaymentStatus.Pending],
          },
        },
      },
      {
        $group: {
          _id: '$taxRate',
          totalSales: { $sum: '$summary.totalWithTax' },
          discount: { $sum: '$summary.discount' },
          taxableAmount: { $sum: '$summary.totalTaxableAmount' },
          totalTax: { $sum: '$summary.totalTax' },
        },
      },
    ]);

    return orders;
  }
}
