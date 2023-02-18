import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { OrderDocument } from './schemas/order.schema';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryOrderDto } from './dto/query-order.dto';
import { MoveOrderItemDto } from './dto/move-order.dto';
import { GroupOrderDto } from './dto/group-order.dto';
import { OrderStatus } from './enum/en.enum';
import { KitchenQueueProcessDto } from './dto/kitchen-queue-process.dto';
import { ChefInquiryDto } from './dto/chef-inquiry.dto';

@Controller('order')
@ApiTags('Orders')
@ApiBearerAuth('access-token')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateOrderDto) {
    return await this.orderService.create(req, dto);
  }

  @Post('preview')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.CREATE)
  async preview(@Req() req, @Body() dto: CreateOrderDto) {
    return await this.orderService.create(req, dto, true);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryOrderDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    return await this.orderService.findAll(req, query, paginateOptions);
  }

  @Get('customer')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async findByCustomer(
    @Req() req,
    @Query() query: QueryOrderDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<OrderDocument>> {
    return await this.orderService.findByCustomer(req, query, paginateOptions);
  }

  @Get(':orderId')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.FETCH)
  async findOne(@Param('orderId') orderId: string) {
    return await this.orderService.findOne(orderId);
  }

  @Patch(':orderId')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.UPDATE)
  async update(
    @Req() req,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return await this.orderService.update(req, orderId, dto);
  }

  @Patch(':orderId/cancel')
  @PermissionGuard(PermissionSubject.Order, Permission.Order.CancelOrder)
  async cancel(@Req() req, @Param('orderId') orderId: string) {
    return await this.orderService.update(req, orderId, {
      status: OrderStatus.Cancelled,
    });
  }

  @Patch(':orderId/sent-to-kitchen')
  @PermissionGuard(PermissionSubject.Order, Permission.Order.SentToKitchen)
  async sentToKitchen(@Req() req, @Param('orderId') orderId: string) {
    return await this.orderService.update(req, orderId, {
      status: OrderStatus.SentToKitchen,
    });
  }

  @Patch(':orderId/on-table')
  @PermissionGuard(PermissionSubject.Order, Permission.Order.OnTable)
  async onTable(@Req() req, @Param('orderId') orderId: string) {
    return await this.orderService.update(req, orderId, {
      status: OrderStatus.OnTable,
    });
  }

  @Patch(':orderId/add-chef-inquiry-comment')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.UPDATE)
  async addChefInquiryComment(
    @Req() req,
    @Param('orderId') orderId: string,
    dto: ChefInquiryDto,
  ) {
    return await this.orderService.generalUpdate(req, orderId, {
      $push: {
        chefInquiry: { ...dto, userId: req.user.userId },
      },
    });
  }

  @Post('move-items')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.UPDATE)
  async moveItems(@Req() req, @Body() dto: MoveOrderItemDto) {
    return await this.orderService.moveItems(req, dto);
  }

  @Post('kitchen-queue-process')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.UPDATE)
  async kitchenQueueProcess(@Req() req, @Body() dto: KitchenQueueProcessDto) {
    return await this.orderService.kitchenQueueProcess(req, dto);
  }

  @Post('group')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.UPDATE)
  async group(@Req() req, @Body() dto: GroupOrderDto) {
    return await this.orderService.groupOrders(req, dto);
  }
}
