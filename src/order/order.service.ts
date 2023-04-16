import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
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
import { QueryCustomerOrderDto, QueryOrderDto } from './dto/query-order.dto';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import { OrderStatus, OrderType, PreparationStatus } from './enum/en.enum';
import { Table, TableDocument } from 'src/table/schemas/table.schema';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { MoveOrderItemDto } from './dto/move-order.dto';
import { GroupOrderDto } from './dto/group-order.dto';
import { KitchenQueueProcessDto } from './dto/kitchen-queue-process.dto';
import {
  KitchenQueue,
  KitchenQueueDocument,
} from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { InvoiceService } from 'src/invoice/invoice.service';
import { InvoiceHelperService } from 'src/invoice/invoice-helper.service';
import { OrderTypes } from 'src/core/Constants/enum';
import * as moment from 'moment';
import 'moment-timezone';
import { TIMEZONE } from 'src/core/Constants/system.constant';

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
          if (parseInt(endArr[0]) <= parseInt(startArr[0])) {
            endDate.add(1, 'd');
          }
          const currentDate = moment().tz(supplier.timezone ?? TIMEZONE);
          console.log(currentDate, startDate, endDate);
          if (
            currentDate.isSameOrAfter(startDate) &&
            currentDate.isSameOrBefore(endDate)
          ) {
            return true;
          }
        });
        if (!matchedPeriod) {
          throw new BadRequestException(`Restaurant is closed`);
        }
      }
    }
    orderData.taxRate = supplier.taxRate ?? 15;

    if (orderData.isScheduled != true) {
      delete orderData.scheduledDateTime;
    }

    // prepare the order items
    orderData.items = await this.orderHelperService.prepareOrderItems(
      orderData,
    );

    orderData.tableFee = {
      fee: 0,
      netBeforeTax: 0,
      tax: 0,
    };

    if (orderData.orderType == OrderType.DineIn) {
      const table = await this.tableModel.findById(orderData.tableId);

      if (!table) throw new NotFoundException(`No Table Found`);
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

    // check for kitchen queue
    if (!orderData.kitchenQueueId) {
      const kitchenQueue = await this.kitchenQueueModel.findOne(
        {
          restaurantId: orderData.restaurantId,
        },
        {},
        { sort: { _id: -1 } },
      );
      if (kitchenQueue) orderData.kitchenQueueId = kitchenQueue._id;
    }

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

    if (req.user.isCustomer) {
      orderData.customerId = req.user.userId;
    }
    // create order
    const order = await this.orderModel.create({
      ...orderData,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });

    // post order create
    this.orderHelperService.postOrderCreate(order);
    return order;
  }

  async findAll(
    req: any,
    query: QueryOrderDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    const queryToApply: any = { ...query };
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
        groupId: null,
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

  async findByCustomer(
    req: any,
    query: QueryCustomerOrderDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    const orders = await this.orderModelPag.paginate(
      {
        ...query,
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
          { path: 'customerId', select: { name: 1 } },
          { path: 'waiterId', select: { name: 1 } },
          { path: 'tableId', select: { name: 1, nameAr: 1 } },
          { path: 'kitchenQueueId', select: { name: 1, nameAr: 1 } },
        ],
      },
    );
    return orders;
  }

  async findOne(orderId: string): Promise<OrderDocument> {
    const exists = await this.orderModel.findById(orderId).populate([
      { path: 'restaurantId', select: { name: 1, nameAr: 1 } },
      { path: 'customerId', select: { name: 1 } },
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
      throw new BadRequestException(`Order is closed. No changes can be made`);
    }

    if (dto.status && dto.status == order.status) {
      throw new BadRequestException(`Order is already on ${dto.status}`);
    }

    if (dto.status && dto.status == OrderStatus.SentToKitchen) {
      // generate kitchen receipt
      orderData.kitchenReceipt =
        await this.invoiceHelperService.generateKitchenReceipt(order);
      orderData.sentToKitchenTime = new Date();
    } else if (dto.status && dto.status == OrderStatus.OnTable) {
      orderData.orderReadyTime = new Date();
    }

    // prepare the order items
    if (dto.items) {
      orderData.couponCode = order.couponCode;
      orderData._id = order._id;

      orderData.items = await this.orderHelperService.prepareOrderItems(
        orderData,
      );

      orderData.summary = await this.calculationService.calculateSummery(
        orderData,
      );
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

  async groupOrders(req: any, dto: GroupOrderDto): Promise<OrderDocument> {
    const orders = await this.orderModel
      .find({
        _id: { $in: dto.orderIds },
        status: { $nin: [OrderStatus.Closed, OrderStatus.Cancelled] },
      })
      .lean();
    if (orders.length == 0)
      throw new BadRequestException(
        'All provided orders are either closed or cancelled',
      );
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
    groupOrder.isGrouped = true;
    groupOrder.taxRate = orders[0].taxRate;
    groupOrder.transactions = [];

    groupOrder.items = await this.orderHelperService.prepareOrderItems(
      groupOrder,
    );

    groupOrder.summary = await this.calculationService.calculateSummery(
      groupOrder,
    );

    groupOrder.orderNumber = await this.orderHelperService.generateOrderNumber(
      supplier._id,
    );

    const groupOrderObj = await this.orderModel.create(groupOrder);

    await this.orderModel.updateMany(
      {
        _id: { $in: dto.orderIds },
      },
      { $set: { groupId: groupOrderObj._id, status: OrderStatus.Cancelled } },
    );
    return groupOrderObj;
  }

  async moveItems(req: any, dto: MoveOrderItemDto): Promise<OrderDocument> {
    const sourceOrder = await this.orderModel.findById(dto.sourceOrderId);
    if (!sourceOrder) throw new NotFoundException(`Source order not found`);

    if (sourceOrder.status == OrderStatus.Closed)
      throw new NotFoundException('Order is closed');

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
      throw new NotFoundException(`Order not found`);
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
    }
    await this.orderModel.updateMany({ _id: dto.orderId }, dataToSet, {
      ...arrayFilter,
    });
    this.orderHelperService.postKitchenQueueProcessing(
      order,
      dto.preparationStatus,
    );
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
}
