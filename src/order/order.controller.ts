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
}
