import { Injectable, NotFoundException } from '@nestjs/common';
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
import { OrderType } from './enum/order.enum';
import { Table, TableDocument } from 'src/table/schemas/table.schema';

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

  async create(req: any, dto: CreateOrderDto): Promise<OrderDocument> {
    const orderData: any = { ...dto };

    const supplier = await this.supplierModel
      .findById(req.user.supplierId)
      .lean();

    // prepare the order items
    orderData.items = await this.orderHelperService.prepareOrderItems(
      dto.items,
      supplier,
    );

    if (orderData.orderType == OrderType.DineIn) {
      const table = await this.tableModel.findById(orderData.tableId);

      orderData.tableFee = table.fees ?? 0;
    }

    // calculate summary
    orderData.summary = await this.calculationService.calculateSummery(
      orderData,
      supplier,
    );

    // create order
    const order = await this.orderModel.create({
      ...orderData,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });

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
    // prepare the order items
    if (dto.items) {
      const supplier = await this.supplierModel
        .findById(req.user.supplierId)
        .lean();

      orderData.items = await this.orderHelperService.prepareOrderItems(
        dto.items,
        supplier,
      );

      orderData.summary = await this.calculationService.calculateSummery(
        orderData,
        supplier,
      );
    }

    const order = await this.orderModel.findByIdAndUpdate(orderId, orderData, {
      new: true,
    });

    if (!order) {
      throw new NotFoundException();
    }

    return order;
  }
}
