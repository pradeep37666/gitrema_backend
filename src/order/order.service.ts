import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeOrderDto, UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, PaginateModel, PaginateResult } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { OrderHelperService } from './order-helper.service';
import { CalculationService } from './calculation.service';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import {
  QueryCustomerOrderDto,
  QueryKitchenDisplayDto,
  QueryOrderDto,
} from './dto/query-order.dto';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import {
  InvoiceStatus,
  OrderPaymentStatus,
  OrderStatus,
  OrderType,
  PreparationStatus,
} from './enum/en.enum';
import { Table, TableDocument } from 'src/table/schemas/table.schema';
import {
  getRandomTime,
  roundOffNumber,
} from 'src/core/Helpers/universal.helper';
import { MoveOrderItemDto } from './dto/move-order.dto';
import { GroupOrderDto } from './dto/group-order.dto';
import { KitchenQueueProcessDto } from './dto/kitchen-queue-process.dto';
import {
  KitchenQueue,
  KitchenQueueDocument,
} from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { InvoiceService } from 'src/invoice/invoice.service';
import { InvoiceHelperService } from 'src/invoice/invoice-helper.service';
import { OrderTypes, PaymentStatus } from 'src/core/Constants/enum';
import * as moment from 'moment';
import 'moment-timezone';
import { TIMEZONE } from 'src/core/Constants/system.constant';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { ExpoPushNotificationService } from 'src/notification/expo-push-notification.service';
import { Printer, PrinterDocument } from 'src/printer/schema/printer.schema';
import { QueryIdentifyPrinterDto } from './dto/query-identify-printer.dto';
import { PrinterType } from 'src/printer/enum/en';
import { Cashier, CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { ObjectId } from 'mongoose';
import { TableHelperService } from 'src/table/table-helper.service';
import { CashierHelperService } from '../cashier/cashier-helper.service';
import {
  DeferredTransaction,
  DeferredTransactionDocument,
} from './schemas/deferred-transaction.schema';
import { DiscountOrderDto } from './dto/discount-order.dto';
import {
  Transaction,
  TransactionDocument,
} from 'src/transaction/schemas/transactions.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Order.name)
    private readonly orderModelPag: PaginateModel<OrderDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    @InjectModel(KitchenQueue.name)
    private readonly kitchenQueueModel: Model<KitchenQueueDocument>,
    @Inject(forwardRef(() => OrderHelperService))
    private readonly orderHelperService: OrderHelperService,
    @Inject(forwardRef(() => CalculationService))
    private readonly calculationService: CalculationService,
    @Inject(forwardRef(() => InvoiceHelperService))
    private readonly invoiceHelperService: InvoiceHelperService,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Printer.name)
    private readonly printerModel: Model<PrinterDocument>,
    @InjectModel(Cashier.name)
    private readonly cashierModel: Model<CashierDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(DeferredTransaction.name)
    private readonly deferredTransactionModel: Model<DeferredTransactionDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly tableHelperService: TableHelperService,
    private readonly cashierHelperService: CashierHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateOrderDto,
    isDryRun = false,
  ): Promise<OrderDocument> {
    const orderData: any = { ...dto, isDryRun };

    const supplier = await this.supplierModel
      .findById(req.user.supplierId)
      .lean();

    if ([OrderType.Delivery, OrderType.Pickup].includes(dto.orderType)) {
      console.log(supplier);
      let workingHours = [supplier.defaultWorkingHours];
      console.log(workingHours);
      if (supplier.overrideWorkingHours?.length > 0) {
        workingHours = supplier.overrideWorkingHours.filter((workingHour) => {
          return (
            workingHour.day ==
            moment()
              .tz(supplier.timezone ?? TIMEZONE)
              .format('dddd')
          );
        });
        console.log(workingHours);
        if (workingHours.length == 0) {
          workingHours = [supplier.defaultWorkingHours];
        }
      }
      console.log(workingHours);
      if (workingHours.length > 0) {
        const matchedPeriod = workingHours.find((workingHour) => {
          const startArr = workingHour.start.split(':');
          const endArr = workingHour.end.split(':');
          if (
            startArr.length == 2 &&
            endArr.length == 2 &&
            parseInt(startArr[0]) == parseInt(endArr[0]) &&
            parseInt(startArr[1]) == parseInt(endArr[1])
          ) {
            return true;
          }

          const startDate = moment()
            .tz(supplier.timezone ?? TIMEZONE)
            .set({
              hour: startArr.length == 2 ? parseInt(startArr[0]) : 0,
              minute: startArr.length == 2 ? parseInt(startArr[1]) : 0,
            });

          const endDate = moment()
            .tz(supplier.timezone ?? TIMEZONE)
            .set({
              hour: endArr.length == 2 ? parseInt(endArr[0]) : 0,
              minute: endArr.length == 2 ? parseInt(endArr[1]) : 0,
            });
          // if (
          //   parseInt(endArr[0]) < parseInt(startArr[0]) ||
          //   (parseInt(endArr[0]) == parseInt(startArr[0]) &&
          //     parseInt(endArr[1]) <= parseInt(startArr[1]))
          // ) {
          //   startDate.subtract(24, 'hours'); // problem is here
          // }
          const currentDate = moment().tz(supplier.timezone ?? TIMEZONE);
          if (endDate.isBefore(startDate)) {
            // special case where end date is less than start date so we need to  adjust the date
            if (currentDate.isBefore(startDate)) {
              // after 00:00
              startDate.subtract(24, 'hours'); // we need to subtract because startdate is becoming bext date after 00:00
            } else {
              // before 00:00
              endDate.add(24, 'hours'); // we need to add because end hours / mins are less than start hours and / mins
            }
          }
          console.log(currentDate, startDate, endDate);
          if (
            currentDate.isSameOrAfter(startDate) &&
            currentDate.isSameOrBefore(endDate)
          ) {
            return true;
          }
          // const currentHour = moment()
          //   .tz(supplier.timezone ?? TIMEZONE)
          //   .hour();
          // const currentMin = moment()
          //   .tz(supplier.timezone ?? TIMEZONE)
          //   .minute();
          // if (
          //   parseInt(endArr[0]) < parseInt(startArr[0]) &&
          //   currentHour < parseInt(endArr[0]) && currentMin
          // ) {
          //   return true;
          // } else if (
          //   parseInt(endArr[0]) > parseInt(startArr[0]) &&
          //   currentHour < parseInt(endArr[0]) &&
          //   currentHour >= parseInt(startArr[0])
          // ) {
          //   return true;
          // }
        });
        if (!matchedPeriod) {
          throw new BadRequestException(
            VALIDATION_MESSAGES.RestaurantClosed.key,
          );
        }
      }
    }
    if (dto.orderType == OrderType.DineIn) {
      if (!req.user.isCustomer) orderData.waiterId = req.user.userId;
    }
    orderData.taxRate = supplier.taxRate ?? 15;

    orderData.feeRate = supplier.feeRate ?? 0;

    if (orderData.isScheduled != true) {
      delete orderData.scheduledDateTime;
    }

    // check for kitchen queue
    if (!orderData.kitchenQueueId) {
      const kitchenQueue = await this.kitchenQueueModel.findOne({
        restaurantId: orderData.restaurantId,
        default: true,
      });
      if (kitchenQueue) orderData.kitchenQueueId = kitchenQueue._id;
    }
    console.log('Kitchen Queue', orderData.kitchenQueueId);

    // prepare the order items
    orderData.items = await this.orderHelperService.prepareOrderItems(
      orderData,
    );
    console.log(orderData.items);
    orderData.tableFee = {
      fee: 0,
      netBeforeTax: 0,
      tax: 0,
    };

    if (orderData.orderType == OrderType.DineIn) {
      const table = await this.tableModel.findById(orderData.tableId);

      if (!table)
        throw new NotFoundException(VALIDATION_MESSAGES.TableNotFound.key);
      const tableFee = table.fees ?? 0;
      const netBeforeTax = supplier.taxEnabledOnTableFee
        ? tableFee / (1 + orderData.taxRate / 100)
        : tableFee;
      const tax = supplier.taxEnabledOnTableFee
        ? (netBeforeTax * orderData.taxRate) / 100
        : 0;
      orderData.tableFee = {
        fee: roundOffNumber(tableFee),
        netBeforeTax: roundOffNumber(netBeforeTax),
        tax: roundOffNumber(tax),
      };
      orderData.sittingStartTime = dto.menuQrCodeScannedTime ?? null;
    }

    // calculate summary
    orderData.summary = await this.calculationService.calculateSummery(
      orderData,
    );

    if (orderData.scheduledDateTime == null) {
      delete orderData.scheduledDateTime;
    }

    orderData.preparationDetails =
      await this.calculationService.calculateOrderPreparationTiming(orderData);

    if (isDryRun) {
      this.orderHelperService.storeCart(orderData);
      return orderData;
    }

    orderData.orderNumber = await this.orderHelperService.generateOrderNumber(
      supplier._id,
    );

    // create order
    const order = await this.orderModel.create({
      ...orderData,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId ?? null,
    });

    // post order create
    this.orderHelperService.postOrderCreate(req, order);
    return order;
  }

  async dateRangeCalculator(req) {
    const response = [];
    for (let i = 0; i < 99; i++) {
      const start = getRandomTime();
      const end = getRandomTime();
      const current = getRandomTime();
      const startArr = start.split(':');
      const endArr = end.split(':');
      const currentArr = current.split(':');
      const res = {
        start,
        end,
        current,
        result: false,
      };
      if (
        startArr.length == 2 &&
        endArr.length == 2 &&
        parseInt(startArr[0]) == parseInt(endArr[0]) &&
        parseInt(startArr[1]) == parseInt(endArr[1])
      ) {
        res.result = true;
      }

      const startDate = moment()
        .tz(TIMEZONE)
        .set({
          hour: startArr.length == 2 ? parseInt(startArr[0]) : 0,
          minute: startArr.length == 2 ? parseInt(startArr[1]) : 0,
        });

      const endDate = moment()
        .tz(TIMEZONE)
        .set({
          hour: endArr.length == 2 ? parseInt(endArr[0]) : 0,
          minute: endArr.length == 2 ? parseInt(endArr[1]) : 0,
        });
      const currentDate = moment()
        .tz(TIMEZONE)
        .set({
          hours: currentArr.length == 2 ? parseInt(currentArr[0]) : 0,
          minutes: currentArr.length == 2 ? parseInt(currentArr[1]) : 0,
        });
      if (endDate.isBefore(startDate)) {
        // special case where end date is less than start date so we need to  adjust the date
        if (currentDate.isBefore(startDate)) {
          // after 00:00
          startDate.subtract(24, 'hours'); // we need to subtract because startdate is becoming bext date after 00:00
        } else {
          // before 00:00
          endDate.add(24, 'hours'); // we need to add because end hours / mins are less than start hours and / mins
        }
      }
      console.log(currentDate, startDate, endDate);
      if (
        currentDate.isSameOrAfter(startDate) &&
        currentDate.isSameOrBefore(endDate)
      ) {
        res.result = true;
      }
      response.push(res);
    }
    return response;
  }

  async findAll(
    req: any,
    query: QueryOrderDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    const queryToApply: any = { ...query };

    if (query.search) {
      queryToApply.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { contactNumber: { $regex: query.search, $options: 'i' } },
        { orderNumber: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.notBelongingToTable) {
      queryToApply.tableId = null;
      delete queryToApply.notBelongingToTable;
    }

    if (paginateOptions.pagination == false) {
      paginateOptions = {
        pagination: true,
        limit: 10,
        page: 1,
      };
    }
    const orders = await this.orderModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        //groupId: null,
        ...queryToApply,
      },
      {
        sort: paginateOptions.sortBy
          ? {
              [paginateOptions.sortBy]: paginateOptions.sortDirection
                ? paginateOptions.sortDirection
                : -1,
            }
          : DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
          { path: 'customerId', select: { name: 1 } },
          { path: 'waiterId', select: { name: 1 } },
          { path: 'tableId', select: { name: 1, nameAr: 1 } },
          { path: 'kitchenQueueId', select: { name: 1, nameAr: 1 } },
        ],
      },
    );
    return orders;
  }

  async kitchenDashboard(req: any, query: QueryKitchenDisplayDto) {
    const queryToApply: any = { ...query };
    const user = await this.userModel.findById(req.user.userId);
    if (user && user.kitchenQueue) {
      queryToApply['items'] = {
        $elemMatch: {
          kitchenQueueId: user.kitchenQueue,
          preparationStatus: {
            $in: [
              PreparationStatus.NotStarted,
              PreparationStatus.StartedPreparing,
            ],
          },
        },
      };
    }
    const totalOrders = await this.orderModel.count({
      restaurantId: query.restaurantId,
      supplierId: req.user.supplierId,
      groupId: null,
      ...queryToApply,
      status: {
        $in: [OrderStatus.SentToKitchen, OrderStatus.StartedPreparing],
      },
    });

    const activeOrders = await this.orderModel.count({
      restaurantId: query.restaurantId,
      supplierId: req.user.supplierId,
      groupId: null,
      ...queryToApply,
      status: {
        $in: [OrderStatus.StartedPreparing],
      },
    });

    const priorityOrdersRes = await this.orderModel.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(query.restaurantId),
          supplierId: new mongoose.Types.ObjectId(req.user.supplierId),
          groupId: null,
          ...queryToApply,
          status: {
            $in: [OrderStatus.StartedPreparing],
          },
        },
      },
      {
        $project: {
          orders: {
            $size: {
              $filter: {
                input: '$preparationDetails',
                as: 'p',
                cond: {
                  $gte: [
                    {
                      $dateAdd: {
                        startDate: '$$p.actualStartTime',
                        unit: 'minute',
                        amount: '$$p.preparationTime',
                      },
                    },
                    new Date(),
                  ],
                },
              },
            },
          },
        },
      },
    ]);
    const priorityOrders =
      priorityOrdersRes && priorityOrdersRes.length > 0
        ? priorityOrdersRes[0].orders
        : 0;

    return { totalOrders, activeOrders, priorityOrders };
  }

  async kitchenDisplay(
    req: any,
    query: QueryKitchenDisplayDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    const queryToApply: any = { ...query };

    const user = await this.userModel.findById(req.user.userId);
    if (user && user.kitchenQueue) {
      queryToApply['items'] = {
        $elemMatch: {
          kitchenQueueId: user.kitchenQueue,
          preparationStatus: {
            $in: [
              PreparationStatus.NotStarted,
              PreparationStatus.StartedPreparing,
            ],
          },
        },
      };
    }
    console.log(queryToApply);
    if (paginateOptions.pagination == false) {
      paginateOptions = {
        pagination: true,
        limit: 10,
        page: 1,
      };
    }
    const orders = await this.orderModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        groupId: null,
        ...queryToApply,
        status: {
          $in: [OrderStatus.SentToKitchen, OrderStatus.StartedPreparing],
        },
      },
      {
        sort: paginateOptions.sortBy
          ? {
              [paginateOptions.sortBy]: paginateOptions.sortDirection
                ? paginateOptions.sortDirection
                : -1,
            }
          : DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
          { path: 'customerId', select: { name: 1 } },
          { path: 'waiterId', select: { name: 1 } },
          { path: 'tableId', select: { name: 1, nameAr: 1 } },
          { path: 'kitchenQueueId', select: { name: 1, nameAr: 1 } },
        ],
      },
    );
    if (user && user.kitchenQueue) {
      orders.docs.forEach((d) => {
        d.items = d.items.filter(
          (di) => di.kitchenQueueId.toString() == user.kitchenQueue.toString(),
        );
      });
    }
    return orders;
  }

  async findByCustomer(
    req: any,
    query: QueryCustomerOrderDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    const queryToApply: any = { ...query };
    if (query.search) {
      queryToApply.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
      ];
    }
    const orders = await this.orderModelPag.paginate(
      {
        ...queryToApply,
        $or: [
          {
            customerId: req.user.userId,
          },
          {
            addedBy: req.user.userId,
          },
        ],
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
          { path: 'customerId' },
          { path: 'waiterId', select: { name: 1 } },
          { path: 'tableId', select: { name: 1, nameAr: 1 } },
          { path: 'kitchenQueueId', select: { name: 1, nameAr: 1 } },
        ],
      },
    );
    return orders;
  }

  async findOne(orderId: string): Promise<OrderDocument> {
    const exists = await this.orderModel
      .findById(orderId)
      .populate([
        { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
        { path: 'customerId' },
        { path: 'waiterId', select: { name: 1 } },
        { path: 'tableId', select: { name: 1, nameAr: 1 } },
        { path: 'kitchenQueueId', select: { name: 1, nameAr: 1 } },
      ]);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    req: any,
    orderId: string,
    dto: UpdateOrderDto,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException();
    }
    const orderData: any = { ...order.toObject(), ...dto };

    if (order.status == OrderStatus.Closed) {
      throw new BadRequestException(VALIDATION_MESSAGES.OrderClosed.key);
    }

    if (dto.status && dto.status == order.status) {
      throw new BadRequestException(
        `${VALIDATION_MESSAGES.SameStatus.key}__${dto.status}`,
      );
    }

    if (dto.status && dto.status == OrderStatus.SentToKitchen) {
      orderData.sentToKitchenTime = new Date();
    } else if (dto.status && dto.status == OrderStatus.OnTable) {
      orderData.orderReadyTime = new Date();
      let orderItemIds = orderData.items.map((oi) => oi._id.toString());
      if (dto.orderItemIds) {
        orderItemIds = dto.orderItemIds;

        delete orderData.status;
      }
      orderData.items.forEach((oi) => {
        if (orderItemIds.includes(oi._id.toString())) {
          oi.preparationStatus = PreparationStatus.OnTable;
        }
      });
    }

    // prepare the order items
    if (dto.items || dto.couponCode) {
      if (!dto.couponCode) orderData.couponCode = order.couponCode;

      orderData._id = order._id;

      orderData.items = await this.orderHelperService.prepareOrderItems(
        orderData,
      );

      orderData.summary = await this.calculationService.calculateSummery(
        orderData,
      );
    }
    // handle payment status
    if (orderData.summary.totalPaid > 0) {
      if (
        orderData.summary.totalPaid >
        orderData.summary.totalWithTax + (orderData.tip ?? 0)
      ) {
        orderData.paymentStatus = OrderPaymentStatus.OverPaid;
      } else if (
        orderData.summary.totalPaid ==
        orderData.summary.totalWithTax + (orderData.tip ?? 0)
      ) {
        orderData.paymentStatus = OrderPaymentStatus.Paid;
      } else {
        orderData.paymentStatus = OrderPaymentStatus.NotPaid;
      }
    }

    const modified = await this.orderModel.findByIdAndUpdate(
      orderId,
      orderData,
      {
        new: true,
      },
    );

    //post order update
    this.orderHelperService.postOrderUpdate(modified, dto, order);
    return modified;
  }

  async restrictedUpdate(
    req: any,
    orderId: string,
    dto: UpdateOrderDto,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findOne({
      _id: orderId,
      status: OrderStatus.New,
      paymentStatus: OrderPaymentStatus.NotPaid,
    });

    if (!order) {
      throw new BadRequestException(`لايوجد لك الصلاحيات الازمة`);
    }
    return await this.update(req, orderId, dto);
  }

  async deferOrder(req, orderId: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException();
    }
    if (order.summary.totalPaid > 0) {
      throw new BadRequestException(
        `This order can not be deferred as some amount is already paid`,
      );
    }
    const cashierId = await this.cashierHelperService.resolveCashierId(
      req,
      null,
      true,
      order.restaurantId,
    );
    await this.deferredTransactionModel.create({
      supplierId: req.user.supplierId,
      restaurantId: order.restaurantId,
      orderId: order._id,
      cashierId,
      amount: order.summary.remainingAmountToCollect,
    });
    const modified = await this.orderModel.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: OrderPaymentStatus.Deferred,
        status: OrderStatus.Closed,
      },
      {
        new: true,
      },
    );
    return modified;
  }

  async groupOrders(req: any, dto: GroupOrderDto): Promise<OrderDocument> {
    const orders = await this.orderModel
      .find({
        _id: { $in: dto.orderIds },
        status: { $nin: [OrderStatus.Closed, OrderStatus.Cancelled] },
      })
      .lean();
    if (orders.length == 0)
      throw new BadRequestException(VALIDATION_MESSAGES.AllOrderClosed.key);
    let items = [];
    orders.forEach((o) => {
      items = items.concat(o.items);
    });

    const supplier = await this.supplierModel
      .findById(orders[0].supplierId)
      .lean();

    const groupOrder = orders[0];
    groupOrder.items = items;
    delete groupOrder._id;
    delete groupOrder.createdAt;
    delete groupOrder.updatedAt;
    delete groupOrder.invoiceStatus;
    delete groupOrder.paymentStatus;
    groupOrder.isGrouped = true;

    groupOrder.transactions = [];

    const orderInKitchen = orders.find(
      (o) => o.status == OrderStatus.SentToKitchen,
    );

    if (orderInKitchen) {
      groupOrder.status = OrderStatus.SentToKitchen;
    }

    groupOrder.items = await this.orderHelperService.prepareOrderItems(
      groupOrder,
    );

    groupOrder.summary.totalPaid = orders.reduce(
      (n, { summary }) => n + summary.totalPaid,
      0,
    );

    groupOrder.summary.totalRefunded = orders.reduce(
      (n, { summary }) => n + summary.totalRefunded,
      0,
    );

    groupOrder.summary = await this.calculationService.calculateSummery(
      groupOrder,
    );

    if (groupOrder.summary.totalPaid > 0) {
      if (
        groupOrder.summary.totalPaid >
        groupOrder.summary.totalWithTax + (groupOrder.tip ?? 0)
      ) {
        groupOrder.paymentStatus = OrderPaymentStatus.OverPaid;
      } else if (
        groupOrder.summary.totalPaid ==
        groupOrder.summary.totalWithTax + (groupOrder.tip ?? 0)
      ) {
        groupOrder.paymentStatus = OrderPaymentStatus.Paid;
      } else {
        groupOrder.paymentStatus = OrderPaymentStatus.NotPaid;
      }
    }

    groupOrder.orderNumber = await this.orderHelperService.generateOrderNumber(
      supplier._id,
    );

    const transactions = await this.transactionModel.find({
      orderId: { $in: dto.orderIds },
      status: PaymentStatus.Success,
    });

    const transactionIds = transactions.map((t) => t._id);
    groupOrder.transactions = transactionIds;
    console.log(groupOrder.items, groupOrder.summary);
    const groupOrderObj = await this.orderModel.create(groupOrder);

    this.orderHelperService.postOrderCreate(req, groupOrderObj);

    this.orderHelperService.generateKitchenReceipts(groupOrderObj);

    for (const i in dto.orderIds) {
      this.update(req, dto.orderIds[i], {
        status: OrderStatus.CancelledByMerge,
        groupId: groupOrderObj._id,
      });
    }

    await this.transactionModel.updateMany(
      { _id: { $in: transactionIds } },
      {
        $set: {
          orderId: groupOrder._id,
        },
      },
    );

    return groupOrderObj;
  }

  async moveItems(req: any, dto: MoveOrderItemDto): Promise<OrderDocument> {
    const sourceOrder = await this.orderModel.findById(dto.sourceOrderId);
    if (!sourceOrder)
      throw new NotFoundException(VALIDATION_MESSAGES.RecordNotFound.key);

    if (sourceOrder.status == OrderStatus.Closed)
      throw new NotFoundException(VALIDATION_MESSAGES.OrderClosed.key);

    const items = [];
    // loop over the received items
    dto.items.forEach((i) => {
      const itemIndex = sourceOrder.items.findIndex((itemObj) => {
        return itemObj._id.toString() == i.itemId;
      });
      if (itemIndex > -1) {
        const itemObj = sourceOrder.items[itemIndex];
        let quantity = itemObj.quantity;
        if (i.quantity > 0) {
          if (i.quantity > quantity)
            throw new NotFoundException(
              `Not enough quantity for ${itemObj.menuItem.name}`,
            );
          quantity = i.quantity;
          sourceOrder.items[itemIndex].quantity -= quantity;
          if (sourceOrder.items[itemIndex].quantity == 0)
            sourceOrder.items.splice(itemIndex, 1);
        } else {
          sourceOrder.items.splice(itemIndex, 1);
        }
        const item = { ...itemObj.toObject(), quantity };
        delete item._id;
        items.push(item);
      } else {
        throw new NotFoundException(`${i.itemId} Not found in source order`);
      }
    });

    if (sourceOrder.items.length == 0)
      throw new NotFoundException(`Not enough items to move`);

    const supplier = await this.supplierModel
      .findById(sourceOrder.supplierId)
      .lean();

    let targetOrder = null;
    if (!dto.targetOrderId) {
      const targetOrderDto = sourceOrder.toObject();
      targetOrderDto.items = items;
      delete targetOrderDto._id;
      delete targetOrderDto.createdAt;
      delete targetOrderDto.updatedAt;
      targetOrderDto.transactions = [];

      targetOrderDto.tableFee = { fee: 0, tax: 0, netBeforeTax: 0 };
      console.log(targetOrderDto.items);
      targetOrderDto.items = await this.orderHelperService.prepareOrderItems(
        targetOrderDto,
      );

      targetOrderDto.summary = await this.calculationService.calculateSummery(
        targetOrderDto,
      );
      targetOrderDto.orderNumber =
        await this.orderHelperService.generateOrderNumber(supplier._id);
      targetOrder = await this.orderModel.create(targetOrderDto);
      this.orderHelperService.postOrderCreate(req, targetOrder);
    } else {
      targetOrder = await this.orderModel.findById(dto.targetOrderId);
      targetOrder.items = targetOrder.items.concat(items);
      // prepare order items
      targetOrder.items = await this.orderHelperService.prepareOrderItems(
        targetOrder.toObject(),
      );
      // prepare summary
      targetOrder.summary = await this.calculationService.calculateSummery(
        targetOrder,
      );
      await targetOrder.save();
    }
    if (targetOrder) {
      sourceOrder.items = await this.orderHelperService.prepareOrderItems(
        sourceOrder.toObject(),
      );
      sourceOrder.summary = await this.calculationService.calculateSummery(
        sourceOrder,
      );
      await sourceOrder.save();
    }
    return targetOrder;
  }

  async kitchenQueueProcess(req: any, dto: KitchenQueueProcessDto) {
    const order = await this.orderModel.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException(VALIDATION_MESSAGES.RecordNotFound.key);
    }

    let actualDateObj: any = {};
    if (dto.preparationStatus == PreparationStatus.StartedPreparing) {
      actualDateObj = {
        status: PreparationStatus.StartedPreparing,
      };
      if (!order.preparationDetails.actualStartTime) {
        actualDateObj['preparationDetails.actualStartTime'] = new Date();
      }
    }
    const dataToSet = {
      $set: {
        'items.$[element].preparationStatus': dto.preparationStatus,
        ...actualDateObj,
      },
    };
    let arrayFilter: any = {
      arrayFilters: [{ 'element._id': { $ne: null } }],
    };
    if (dto.orderItemId) {
      arrayFilter = {
        arrayFilters: [
          { 'element._id': new mongoose.Types.ObjectId(dto.orderItemId) },
        ],
      };
    } else {
      const user = await this.userModel.findById(req.user.userId);
      if (user && user.kitchenQueue) {
        arrayFilter = {
          arrayFilters: [
            {
              'element.kitchenQueueId': new mongoose.Types.ObjectId(
                user.kitchenQueue.toString(),
              ),
            },
          ],
        };
      }
    }
    await this.orderModel.updateMany({ _id: dto.orderId }, dataToSet, {
      ...arrayFilter,
    });
    await this.orderHelperService.postKitchenQueueProcessing(order, dto);
    return true;
  }

  async generalUpdate(
    req: any,
    orderId: string,
    dto: any,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(orderId, dto, {
      new: true,
    });

    if (!order) {
      throw new NotFoundException();
    }
    return order;
  }

  async identifyPrinters(
    req,
    query: QueryIdentifyPrinterDto,
    order: OrderDocument = null,
    returnPrinterItems = false,
  ) {
    if (!order) {
      order = await this.orderModel.findById(query.orderId);
    }

    if (!order) {
      throw new NotFoundException();
    }

    let printers = [],
      printerItems = [],
      itemsWithoutPrinter = [];
    // if (!query.printerType || query.printerType == PrinterType.Cashier) {
    //   if (order.cashierId) {
    //     const cashier = await this.cashierModel.findById(order.cashierId);
    //     if (cashier && cashier.printerId) {
    //       printers.push(cashier.printerId.toString());
    //     }
    //   }
    //}
    if (!query.printerType || query.printerType == PrinterType.Kitchen) {
      const menuItemIds = order.items.map((oi) => oi.menuItem.menuItemId);
      const menuItems = await this.menuItemModel
        .find({
          _id: { $in: menuItemIds },
        })
        .populate([
          {
            path: 'categoryId',
            select: { printerId: 1 },
          },
        ]);
      for (const i in menuItems) {
        if (menuItems[i].categoryId?.printerId) {
          printers.push(menuItems[i].categoryId?.printerId.toString());
          if (!printerItems[menuItems[i].categoryId?.printerId.toString()]) {
            printerItems[menuItems[i].categoryId?.printerId.toString()] = [];
          }
          printerItems[menuItems[i].categoryId?.printerId.toString()].push(
            menuItems[i]._id.toString(),
          );
        } else {
          itemsWithoutPrinter.push(menuItems[i]._id.toString());
        }
      }
    }
    if (itemsWithoutPrinter.length > 0) {
      const defaultKitchenPrinter = await this.printerModel.findOne({
        isDefault: true,
        supplierId: req.user.supplierId,
        type: PrinterType.Kitchen,
      });
      if (defaultKitchenPrinter) {
        printers.push(defaultKitchenPrinter._id.toString());
        printerItems[defaultKitchenPrinter._id.toString()] =
          itemsWithoutPrinter;
      }
    }
    printers = [...new Set(printers)];
    if (returnPrinterItems) {
      return { printers, printerItems };
    }
    return printers;
  }
}
