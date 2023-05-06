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
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { QueryPurchaseOrderDto } from './dto/query-purchase-order.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PurchaseOrderDocument } from './schemas/purchase-order.schema';
import { PaginateResult } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('purchase-order')
@ApiTags('Purchase Orders')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreatePurchaseOrderDto) {
    return await this.purchaseOrderService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryPurchaseOrderDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PurchaseOrderDocument>> {
    return await this.purchaseOrderService.findAll(req, query, paginateOptions);
  }

  @Get(':purchaseOrderId')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.FETCH)
  async findOne(
    @Param('purchaseOrderId') purchaseOrderId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.findOne(purchaseOrderId, i18n);
  }

  @Patch(':purchaseOrderId')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.UPDATE)
  async update(
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.update(purchaseOrderId, dto, i18n);
  }

  @Delete(':purchaseOrderId')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.DELETE)
  async remove(
    @Param('purchaseOrderId') purchaseOrderId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.remove(purchaseOrderId, i18n);
  }
}
