import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { OrderHelperService } from './order-helper.service';
import { CalculationService } from './calculation.service';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryOrderDto } from './dto/query-order.dto';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import { OrderStatus, OrderType } from './enum/en.enum';
import { Table, TableDocument } from 'src/table/schemas/table.schema';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { MoveOrderItemDto } from './dto/move-order.dto';

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
    private readonly orderHelperService: OrderHelperService,
    private readonly calculationService: CalculationService,
  ) {}

  async create(
    req: any,
    dto: CreateOrderDto,
    isDryRun = false,
  ): Promise<OrderDocument> {
    const orderData: any = { ...dto };

    const supplier = await this.supplierModel
      .findById(req.user.supplierId)
      .lean();

    const taxRate = supplier.taxRate ?? 15;

    // prepare the order items
    orderData.items = await this.orderHelperService.prepareOrderItems(
      dto,
      supplier,
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
        ? tableFee / (1 + taxRate / 100)
        : tableFee;
      const tax = supplier.taxEnabledOnTableFee
        ? (netBeforeTax * taxRate) / 100
        : 0;
      orderData.tableFee = {
        fee: roundOffNumber(tableFee),
        netBeforeTax: roundOffNumber(netBeforeTax),
        tax: roundOffNumber(tax),
      };
      orderData.sittingStartTime =
        table.startingTime ?? dto.menuQrCodeScannedTime ?? null;
    }

    // calculate summary
    orderData.summary = await this.calculationService.calculateSummery(
      orderData,
    );

    if (isDryRun) {
      return orderData;
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
    const orders = await this.orderModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        ...query,
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

  async findByCustomer(
    req: any,
    query: QueryOrderDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    const orders = await this.orderModelPag.paginate(
      {
        ...query,
        customerId: req.user.userId,
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
    const orderData: any = { ...dto };

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new NotFoundException();
    }

    if (order.status == OrderStatus.Paid) {
      throw new BadRequestException(`No changes can be made after payment`);
    }

    if (dto.status && dto.status == OrderStatus.Processing) {
      orderData.sentToKitchenTime = new Date();
    } else if (dto.status && dto.status == OrderStatus.OnTable) {
      orderData.orderReadyTime = new Date();
    }

    // prepare the order items
    if (dto.items) {
      orderData.couponCode = order.couponCode;
      orderData._id = order._id;

      const supplier = await this.supplierModel
        .findById(req.user.supplierId)
        .lean();

      orderData.items = await this.orderHelperService.prepareOrderItems(
        dto,
        supplier,
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
    this.orderHelperService.postOrderUpdate(order, dto);
    return modified;
  }

  async moveItems(req: any, dto: MoveOrderItemDto) {
    const sourceOrder = await this.orderModel.findById(dto.sourceOrderId);
    if (!sourceOrder) throw new NotFoundException(`Source order not found`);
    if (sourceOrder.items.length <= 1)
      throw new NotFoundException(`Not enough items to move`);
    const items = sourceOrder.items.filter((i) => {
      return dto.items.includes(i._id.toString());
    });
    let targetOrder = null;
    if (!dto.targetOrderId) {
      const targetOrderDto = { ...sourceOrder.toObject() };
      targetOrderDto.items = items;
      delete targetOrderDto._id;
      delete targetOrderDto.createdAt;
      delete targetOrderDto.updatedAt;
      targetOrderDto.transactions = [];

      targetOrderDto.tableFee = { fee: 0, tax: 0, netBeforeTax: 0 };
      targetOrderDto.summary = await this.calculationService.calculateSummery(
        targetOrderDto,
      );
      targetOrder = await this.orderModel.create(targetOrderDto);
    } else {
      targetOrder = await this.orderModel.findById(dto.targetOrderId);
      targetOrder.items = targetOrder.items.concat(items);
      targetOrder.summary = await this.calculationService.calculateSummery(
        targetOrder,
      );
      await targetOrder.save();
    }
    if (targetOrder) {
      const remainingItems = sourceOrder.items.filter((i) => {
        return !dto.items.includes(i._id.toString());
      });
      sourceOrder.items = remainingItems;
      sourceOrder.summary = await this.calculationService.calculateSummery(
        sourceOrder,
      );
      await sourceOrder.save();
    }
    return targetOrder;
  }

  async generalUpdate(
    req: any,
    orderId: string,
    dto: any,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(orderId, dto);

    if (!order) {
      throw new NotFoundException();
    }
    return order;
  }
}
