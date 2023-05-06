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
import { GoodsReceiptService } from './goods-receipt.service';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { QueryGoodsReceiptDto } from './dto/query-goods-receipt.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { GoodsReceiptDocument } from './schemas/goods-receipt.schema';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('goods-receipt')
@ApiTags('Goods Receipts')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class GoodsReceiptController {
  constructor(private readonly goodsReceiptService: GoodsReceiptService) {}

  @Post()
  @PermissionGuard(PermissionSubject.GoodsReceipt, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() dto: CreateGoodsReceiptDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.goodsReceiptService.create(req, dto, i18n);
  }

  @Get()
  @PermissionGuard(PermissionSubject.GoodsReceipt, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryGoodsReceiptDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<GoodsReceiptDocument>> {
    return await this.goodsReceiptService.findAll(req, query, paginateOptions);
  }

  @Get(':goodsReceiptId')
  @PermissionGuard(PermissionSubject.GoodsReceipt, Permission.Common.FETCH)
  async findOne(
    @Param('goodsReceiptId') goodsReceiptId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.goodsReceiptService.findOne(goodsReceiptId, i18n);
  }

  @Patch(':goodsReceiptId')
  @PermissionGuard(PermissionSubject.GoodsReceipt, Permission.Common.UPDATE)
  async update(
    @Param('goodsReceiptId') goodsReceiptId: string,
    @Body() dto: UpdateGoodsReceiptDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.goodsReceiptService.update(goodsReceiptId, dto, i18n);
  }

  @Delete(':goodsReceiptId')
  @PermissionGuard(PermissionSubject.GoodsReceipt, Permission.Common.DELETE)
  async remove(
    @Param('goodsReceiptId') goodsReceiptId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.goodsReceiptService.remove(goodsReceiptId, i18n);
  }
}
