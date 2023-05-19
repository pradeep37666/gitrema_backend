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
import { InvoiceReceiptService } from './invoice-receipt.service';
import { CreateInvoiceReceiptDto } from './dto/create-invoice-receipt.dto';
import { UpdateInvoiceReceiptDto } from './dto/update-invoice-receipt.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { QueryInvoiceReceiptDto } from './dto/query-invoice-receipt.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { InvoiceReceiptDocument } from './schema/invoice-receipt.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('invoice-receipt')
@ApiTags('Invoice Receipts')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class InvoiceReceiptController {
  constructor(private readonly invoiceReceiptService: InvoiceReceiptService) {}

  @Post()
  @PermissionGuard(PermissionSubject.InvoiceReceipt, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() dto: CreateInvoiceReceiptDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.invoiceReceiptService.create(req, dto, i18n);
  }

  @Get()
  @PermissionGuard(PermissionSubject.InvoiceReceipt, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryInvoiceReceiptDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InvoiceReceiptDocument>> {
    return await this.invoiceReceiptService.findAll(
      req,
      query,
      paginateOptions,
    );
  }

  @Get(':invoiceReceiptId')
  @PermissionGuard(PermissionSubject.InvoiceReceipt, Permission.Common.FETCH)
  async findOne(
    @Param('invoiceReceiptId') invoiceReceiptId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.invoiceReceiptService.findOne(invoiceReceiptId, i18n);
  }

  @Patch(':invoiceReceiptId')
  @PermissionGuard(PermissionSubject.InvoiceReceipt, Permission.Common.UPDATE)
  async update(
    @Param('invoiceReceiptId') invoiceReceiptId: string,
    @Body() dto: UpdateInvoiceReceiptDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.invoiceReceiptService.update(invoiceReceiptId, dto, i18n);
  }

  @Delete(':invoiceReceiptId')
  @PermissionGuard(PermissionSubject.InvoiceReceipt, Permission.Common.DELETE)
  async remove(
    @Param('invoiceReceiptId') invoiceReceiptId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.invoiceReceiptService.remove(invoiceReceiptId, i18n);
  }
}
