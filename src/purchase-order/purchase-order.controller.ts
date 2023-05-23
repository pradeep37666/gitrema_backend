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
import { QueryPurchaseOrderPreviewDto } from './dto/query-purchase-order-preview.dto';
import { PurchaseOrderStatus } from './enum/en';
import { FillToParDto } from './dto/fill-to-par.dto';

@Controller('purchase-order')
@ApiTags('Purchase Orders')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() dto: CreatePurchaseOrderDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.create(req, dto, i18n);
  }

  @Post('create-preview')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.CREATE)
  async createDraft(
    @Req() req,
    @Body() dto: CreatePurchaseOrderDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.createDraft(req, dto, i18n);
  }

  @Get('fill-to-par')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.FETCH)
  async fillToPar(
    @Req() req,
    @Query() dto: FillToParDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.fillToPar(req, dto, i18n);
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

  @Get('fetch-preview')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.LIST)
  async fetchDraftPos(
    @Req() req,
    @Query() query: QueryPurchaseOrderDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<PurchaseOrderDocument>> {
    return await this.purchaseOrderService.findAll(
      req,
      query,
      paginateOptions,
      PurchaseOrderStatus.Draft,
    );
  }

  @Get('sheet')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.FETCH)
  async sheet(
    @Req() req,
    @Query() query: QueryPurchaseOrderPreviewDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<any> {
    return await this.purchaseOrderService.sheet(req, query, paginateOptions);
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
    @Req() req,
    @Param('purchaseOrderId') purchaseOrderId: string,
    @Body() dto: UpdatePurchaseOrderDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.update(
      req,
      purchaseOrderId,
      dto,
      i18n,
    );
  }

  @Patch(':purchaseOrderId/confirm')
  @PermissionGuard(PermissionSubject.PurchaseOrder, Permission.Common.UPDATE)
  async confirm(
    @Req() req,
    @Param('purchaseOrderId') purchaseOrderId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.purchaseOrderService.confirm(req, purchaseOrderId, i18n);
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
