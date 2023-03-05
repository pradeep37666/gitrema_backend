import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Offer, OfferDocument } from 'src/offer/schemas/offer.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import * as moment from 'moment';
import { CalculationType } from 'src/core/Constants/enum';
import { ApplicationType } from 'src/offer/enum/en.enum';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { OrderStatus } from './enum/en.enum';
import { Order, OrderDocument } from './schemas/order.schema';
import { OrderService } from './order.service';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { SocketEvents } from 'src/socket-io/enum/events.enum';

@Injectable()
export class CalculationService {
  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private socketGateway: SocketIoGateway,
  ) {}

  async calculateSummery(orderData) {
    const summary = {
      totalBeforeDiscount: 0,
      discount: 0,
      totalWithTax: 0,
      totalTaxableAmount: 0,
      totalTax: 0,
      totalPaid: 0,
      totalRefunded: 0,
      headerDiscount: 0,
    };

    let offer = await this.offerModel.findOne(
      {
        active: true,
        deletedAt: null,
        start: {
          $lte: new Date(moment.utc().format('YYYY-MM-DD')),
        },
        end: {
          $gte: new Date(moment.utc().format('YYYY-MM-DD')),
        },
        applicationType: ApplicationType.Header,
        code: null,
      },
      {},
      { sort: { priority: 1 } },
    );
    if (!offer && orderData.couponCode) {
      offer = await this.offerModel.findOne(
        {
          active: true,
          deletedAt: null,
          start: {
            $lte: new Date(moment.utc().format('YYYY-MM-DD')),
          },
          end: {
            $gte: new Date(moment.utc().format('YYYY-MM-DD')),
          },
          code: orderData.couponCode,
          applicationType: ApplicationType.Header,
        },
        {},
        { sort: { priority: 1 } },
      );
      if (
        offer &&
        offer.maxNumberAllowed &&
        offer.maxNumberAllowed <= offer.totalUsed
      )
        offer = null;
    }

    summary.totalBeforeDiscount += orderData.items.reduce(
      (acc, oi) => acc + oi.amountBeforeDiscount,
      0,
    );

    summary.discount += orderData.items.reduce(
      (acc, oi) => acc + oi.discount,
      0,
    );

    summary.totalWithTax += orderData.items.reduce(
      (acc, oi) => acc + oi.amountAfterDiscount,
      0,
    );

    // summary.totalTaxableAmount += orderData.items.reduce(
    //   (acc, oi) => acc + oi.itemTaxableAmount,
    //   0,
    // );

    // summary.totalTax += orderData.items.reduce((acc, oi) => acc + oi.tax, 0);

    //apply table fee in tax
    summary.totalBeforeDiscount += orderData.tableFee.fee;
    summary.totalWithTax += orderData.tableFee.fee;

    // apply header discount
    if (offer) {
      summary.headerDiscount =
        offer.discountType == CalculationType.Fixed
          ? offer.discount
          : roundOffNumber((summary.totalWithTax * offer.discount) / 100);
      summary.headerDiscount = offer.maxDiscount
        ? summary.headerDiscount > offer.maxDiscount
          ? offer.maxDiscount
          : summary.headerDiscount
        : summary.headerDiscount;

      summary.discount += summary.headerDiscount;

      summary.totalWithTax -= summary.headerDiscount;
    }

    summary.totalTaxableAmount =
      summary.totalWithTax / (1 + orderData.taxRate / 100);

    summary.totalTax = (summary.totalTaxableAmount * orderData.taxRate) / 100;

    summary.totalBeforeDiscount = roundOffNumber(summary.totalBeforeDiscount);
    summary.discount = roundOffNumber(summary.discount);
    summary.totalWithTax = roundOffNumber(summary.totalWithTax);
    summary.totalTaxableAmount = roundOffNumber(summary.totalTaxableAmount);
    summary.totalTax = roundOffNumber(summary.totalTax);

    return summary;
  }

  calculateTax(
    unitPrice: number,
    quantity: number,
    taxRate: number,
  ): {
    taxableAmount: number;
    tax: number;
    totalWithTax: number;
  } {
    const totalWithTax = roundOffNumber(unitPrice * quantity);
    const taxableAmount = roundOffNumber(totalWithTax / (1 + taxRate / 100));

    const tax = roundOffNumber((taxableAmount * taxRate) / 100);
    return { taxableAmount, tax, totalWithTax };
  }

  async calculateOrderPreparationTiming(orderData, status = null) {
    const { isScheduled, scheduledDateTime, kitchenQueueId } = orderData;
    const preparationDetails = {
      preparationTime: 0,
      expectedStartTime: moment.utc().toDate(),
      expectedEndTime: moment.utc().toDate(),
      // actualStartTime: moment.utc().toDate(),
      // actualEndTime: moment.utc().toDate(),
      kitchenSortingNumber: 1,
    };

    preparationDetails.preparationTime = orderData.items.reduce(
      (acc, oi) => acc + oi.preparationTime ?? 0,
      0,
    );
    let statusToCheck = [OrderStatus.SentToKitchen, OrderStatus.New];
    if (status) {
      console.log('Inside --> Calculate Sent To Kitchen');
      statusToCheck = [OrderStatus.SentToKitchen];
    }
    // commenting the  schedule activities
    // if (isScheduled) {
    //   preparationDetails.expectedEndTime =
    //     moment.utc(scheduledDateTime).toDate();
    //   preparationDetails.expectedStartTime =
    //      moment
    //       .utc(scheduledDateTime)
    //       .add(-1 * preparationDetails.preparationTime, 'm')
    //       .toDate();
    //   const lastOrderBeforeScheduled = await this.orderModel.findOne(
    //     {
    //       'preparationDetails.expectedEndTime': {
    //         $lte: preparationDetails.expectedStartTime,
    //       },
    //       kitchenQueueId: orderData.kitchenQueueId,
    //       status: { $in: [OrderStatus.SentToKitchen, OrderStatus.New] },
    //     },
    //     {},
    //     { sort: { 'preparationDetails.expectedStartTime': -1 } },
    //   );
    //   console.log(lastOrderBeforeScheduled);
    //   if (lastOrderBeforeScheduled)
    //     preparationDetails.kitchenSortingNumber =
    //       lastOrderBeforeScheduled.preparationDetails.kitchenSortingNumber + 1;

    //   //check conflicts with existing scheduled orders
    //   const { expectedStartTime, expectedEndTime, preparationTime } =
    //     preparationDetails;
    //   const scheduledOrders = await this.orderModel
    //     .find(
    //       {
    //         isScheduled: true,
    //         kitchenQueueId: orderData.kitchenQueueId,
    //         status: { $in: [OrderStatus.New, OrderStatus.SentToKitchen] },
    //       },
    //       {},
    //       {
    //         sort: {
    //           'preparationDetails.expectedStartTime': 1,
    //         },
    //       },
    //     )
    //     .lean();

    //   scheduledOrders.forEach((order, index, arr) => {
    //     if (
    //       order.preparationDetails.expectedStartTime <= expectedEndTime &&
    //       order.preparationDetails.expectedEndTime >= expectedStartTime
    //     ) {
    //       // Calculte available slots before and after conflicted order

    //       // const nextScheduled = arr[index  1];
    //       // let availableSlot;
    //       // if (nextScheduled) {
    //       //check if order fits in between
    //       // } else {
    //       // availableSlot = moment(order.preparationDetails.expectedEndTime)
    //       //   .add(preparationTime, 'm')
    //       //   .toDate();
    //       //  }
    //       throw new ForbiddenException(
    //         `Cannot schedule order, slot already reserved for respective kitchen ${orderData.kitchenQueueId}.`,
    //       );
    //     }
    //   });

    //   orderData.preparationDetails = preparationDetails;
    // } else {
    if (kitchenQueueId) {
      const orderList = await this.orderModel
        .find(
          {
            kitchenQueueId,
            status: { $in: statusToCheck },
            _id: { $ne: orderData._id },
            'preparationDetails.expectedEndTime': {
              $gte: preparationDetails.expectedStartTime,
            },
          },
          {},
          {
            sort: {
              'preparationDetails.expectedStartTime': 1,
            },
          },
        )
        .lean();

      const idx = orderList.findIndex((o, idx) => {
        if (idx == 0) {
          return (
            preparationDetails.expectedEndTime.getTime() <=
            o.preparationDetails.expectedStartTime.getTime()
          );
        } else {
          console.log(
            idx,
            orderList[idx].preparationDetails.expectedStartTime.getTime(),
            orderList[idx - 1].preparationDetails.expectedEndTime.getTime(),
            preparationDetails.preparationTime * 60 * 1000,
          );
          return (
            orderList[idx].preparationDetails.expectedStartTime.getTime() -
              orderList[idx - 1].preparationDetails.expectedEndTime.getTime() >=
            preparationDetails.preparationTime * 60 * 1000
          );
        }
      });
      console.log(orderList, idx);
      let lastOrder = null;
      if (orderList.length) {
        lastOrder =
          idx == -1 && orderList.length > 0
            ? orderList[orderList.length - 1]
            : idx > 0
            ? orderList[idx - 1]
            : null;
      }
      console.log(lastOrder);
      if (lastOrder) {
        preparationDetails.expectedStartTime = moment
          .utc(lastOrder.preparationDetails.expectedEndTime)
          .toDate();
        preparationDetails.expectedEndTime = moment
          .utc(lastOrder.preparationDetails.expectedEndTime)
          .add(preparationDetails.preparationTime, 'm')
          .toDate();
        preparationDetails.kitchenSortingNumber =
          lastOrder.preparationDetails.kitchenSortingNumber + 1;
      } else {
        preparationDetails.expectedStartTime = moment.utc().toDate();
        preparationDetails.expectedEndTime = moment
          .utc()
          .add(preparationDetails.preparationTime, 'm')
          .toDate();
      }
    } else {
      preparationDetails.expectedStartTime = moment.utc().toDate();
      preparationDetails.expectedEndTime = moment
        .utc()
        .add(preparationDetails.preparationTime, 'm')
        .toDate();
    }
    //}
    console.log('Setting Order Preparation ', preparationDetails);
    return preparationDetails;
  }

  async handleOrderPreparationAfterUpdate(order: OrderDocument) {
    console.log('Inside After Update');
    const preparationTime = order.items.reduce(
      (acc, oi) => acc + oi.preparationTime ?? 0,
      0,
    );
    if (preparationTime != order.preparationDetails.preparationTime) {
      const lastOrder = await this.orderModel
        .findOne(
          {
            kitchenQueueId: order.kitchenQueueId,
            status: order.status,
            _id: { $ne: order._id },
          },
          {},
          {
            sort: {
              'preparationDetails.expectedStartTime': -1,
            },
          },
        )
        .lean();
      const preparationDetails = order.preparationDetails;
      let startTime = moment.utc().toDate();
      let kitchenSortingNumber = 1;
      if (lastOrder) {
        startTime = lastOrder.preparationDetails.expectedEndTime;
        kitchenSortingNumber +=
          lastOrder.preparationDetails.kitchenSortingNumber;
      }
      preparationDetails.preparationTime = preparationTime;
      preparationDetails.expectedStartTime = startTime;
      preparationDetails.expectedEndTime = moment
        .utc(startTime)
        .add(preparationDetails.preparationTime, 'm')
        .toDate();
      order.preparationDetails = preparationDetails;
      await order.save();
    }
  }

  async identifyOrdersToRecalculateAfterSentToKitchen(orderData) {
    console.log('Inside After Sent To Kitchen');
    if (!orderData.kitchenQueueId) return; // skipping the further execution as kitchen queue does not exist
    const ordersToRecalculate = await this.orderModel.find(
      {
        // isScheduled: false,
        kitchenQueueId: orderData.kitchenQueueId,
        status: OrderStatus.New,
      },
      {},
      { sort: { 'preparationDetails.expectedStartTime': 1 } },
    );
    let preparationDetails = orderData.preparationDetails;
    const orderList = await this.orderModel
      .find(
        {
          isScheduled: true,
          kitchenQueueId: orderData.kitchenQueueId,
          status: { $in: [OrderStatus.SentToKitchen, OrderStatus.New] },
          'preparationDetails.expectedStartTime': {
            $gt: orderData.preparationDetails.expectedStartTime,
          },
        },
        {},
        {
          sort: {
            'preparationDetails.expectedStartTime': 1,
          },
        },
      )
      .lean();
    for (const i in ordersToRecalculate) {
      preparationDetails = await this.recalculatePreparationTime(
        orderList,
        ordersToRecalculate[i],
        preparationDetails.expectedEndTime,
        preparationDetails.kitchenSortingNumber,
      );
    }
    this.socketGateway.emit(
      orderData.supplierId.toString(),
      SocketEvents.KitchenQueue,
      { KitchenQueueId: orderData.kitchenQueueId, orderListRefresh: true },
    );
  }

  async identifyOrdersToRecalculateAfterCompleted(orderData) {
    console.log('Inside After Completed');
    const ordersToRecalculate = await this.orderModel.find(
      {
        'preparationDetails.expectedStartTime': {
          $gt: orderData.preparationDetails.expectedStartTime,
        },
        // isScheduled: false,
        kitchenQueueId: orderData.kitchenQueueId,
        status: { $in: [OrderStatus.SentToKitchen, OrderStatus.New] },
      },
      {},
      { sort: { 'preparationDetails.expectedStartTime': 1 } },
    );
    let refOrder = await this.orderModel.findOne(
      {
        'preparationDetails.expectedStartTime': {
          $lt: orderData.preparationDetails.expectedStartTime,
        },
        kitchenQueueId: orderData.kitchenQueueId,
        status: { $in: [OrderStatus.SentToKitchen, OrderStatus.New] },
      },
      {},
      { sort: { 'preparationDetails.expectedStartTime': -1 } },
    );
    if (!refOrder) {
      refOrder = orderData;
    }
    let preparationDetails = refOrder.preparationDetails;
    const orderList = await this.orderModel
      .find(
        {
          isScheduled: true,
          kitchenQueueId: orderData.kitchenQueueId,
          status: { $in: [OrderStatus.SentToKitchen, OrderStatus.New] },
          'preparationDetails.expectedStartTime': {
            $gt: orderData.preparationDetails.expectedStartTime,
          },
        },
        {},
        {
          sort: {
            'preparationDetails.expectedStartTime': 1,
          },
        },
      )
      .lean();
    for (const i in ordersToRecalculate) {
      preparationDetails = await this.recalculatePreparationTime(
        orderList,
        ordersToRecalculate[i],
        preparationDetails.expectedEndTime,
        preparationDetails.kitchenSortingNumber,
      );
    }
  }

  async identifyOrdersToRecalculateForScheduled(orderData, status = null) {
    console.log('Inside After Scheduled');
    let statusToCheck = [OrderStatus.SentToKitchen, OrderStatus.New];
    if (status) {
      console.log('Inside --> Calculate Sent To Kitchen');
      statusToCheck = [OrderStatus.SentToKitchen];
    }
    const ordersToRecalculate = await this.orderModel.find(
      {
        $or: [
          {
            'preparationDetails.expectedStartTime': {
              $gte: orderData.preparationDetails.expectedStartTime,
            },
          },
          {
            'preparationDetails.expectedStartTime': {
              $lte: orderData.preparationDetails.expectedEndTime,
            },
            'preparationDetails.expectedEndTime': {
              $gt: orderData.preparationDetails.expectedStartTime,
            },
          },
        ],
        isScheduled: false,
        kitchenQueueId: orderData.kitchenQueueId,
        status: { $in: statusToCheck },
      },
      {},
      { sort: { 'preparationDetails.expectedStartTime': 1 } },
    );
    console.log(
      {
        kitchenSortingNumber: {
          $gte: orderData.preparationDetails.kitchenSortingNumber,
        },
        isScheduled: false,
        kitchenQueueId: orderData.kitchenQueueId,
        status: { $in: statusToCheck },
      },
      ordersToRecalculate,
    );
    let preparationDetails = orderData.preparationDetails;
    const orderList = await this.orderModel
      .find(
        {
          isScheduled: true,
          kitchenQueueId: orderData.kitchenQueueId,
          status: { $in: statusToCheck },
          _id: { $ne: orderData._id },
          'preparationDetails.expectedStartTime': {
            $gt: orderData.preparationDetails.expectedStartTime,
          },
        },
        {},
        {
          sort: {
            'preparationDetails.expectedStartTime': 1,
          },
        },
      )
      .lean();
    for (const i in ordersToRecalculate) {
      preparationDetails = await this.recalculatePreparationTime(
        orderList,
        ordersToRecalculate[i],
        preparationDetails.expectedEndTime,
        preparationDetails.kitchenSortingNumber,
      );
    }
  }

  async recalculatePreparationTime(
    orderList,
    orderData,
    startTime,
    kitchenSortingNumber,
  ) {
    const preparationDetails = orderData.preparationDetails;
    preparationDetails.expectedStartTime = moment.utc(startTime).toDate();
    preparationDetails.expectedEndTime = moment
      .utc(startTime)
      .add(orderData.preparationDetails.preparationTime, 'm')
      .toDate();
    preparationDetails.kitchenSortingNumber = kitchenSortingNumber + 1;
    console.log('Before Recalculate ', preparationDetails);
    // preparationDetails = await this.validateSlotAndReCalculateIfNeeded(
    //   orderList,
    //   preparationDetails,
    // );
    this.orderService.generalUpdate(null, orderData._id, {
      preparationDetails,
    });
    console.log('After Recalculate ', preparationDetails);

    return preparationDetails;
  }

  async validateSlotAndReCalculateIfNeeded(orderList, preparationDetails) {
    const idx = orderList.findIndex((o, idx) => {
      if (idx == 0) {
        return (
          preparationDetails.expectedEndTime.getTime() <=
          o.preparationDetails.expectedStartTime.getTime()
        );
      } else {
        console.log(
          idx,
          orderList[idx].preparationDetails.expectedStartTime.getTime(),
          orderList[idx - 1].preparationDetails.expectedEndTime.getTime(),
          preparationDetails.preparationTime * 60,
        );
        return (
          orderList[idx].preparationDetails.expectedStartTime.getTime() -
            orderList[idx - 1].preparationDetails.expectedEndTime.getTime() >=
          preparationDetails.preparationTime * 60
        );
      }
    });
    let lastOrder = null;
    if (orderList.length) {
      lastOrder =
        idx == -1 && orderList.length > 0
          ? orderList[orderList.length - 1]
          : idx > 0
          ? orderList[idx - 1]
          : null;
    }

    if (lastOrder) {
      preparationDetails.expectedStartTime = moment
        .utc(lastOrder.preparationDetails.expectedEndTime)
        .toDate();
      preparationDetails.expectedEndTime = moment
        .utc(lastOrder.preparationDetails.expectedEndTime)
        .add(preparationDetails.preparationTime, 'm')
        .toDate();
      preparationDetails.kitchenSortingNumber =
        lastOrder.preparationDetails.kitchenSortingNumber + 1;
    }
    return preparationDetails;
  }
}
