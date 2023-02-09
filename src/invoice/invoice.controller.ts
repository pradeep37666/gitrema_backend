import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { InvoiceDocument } from './schemas/invoice.schema';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';

@ApiTags('Invoice')
@ApiBearerAuth('access-token')
@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Invoice, Permission.Common.CREATE)
  async create(
    @Request() req,
    @Body() dto: CreateInvoiceDto,
  ): Promise<InvoiceDocument> {
    return await this.invoiceService.create(req, dto);
  }

  // @Get()
  // @PermissionGuard(PermissionSubject.Invoice, Permission.Common.LIST)
  // async all(
  //   @Request() req,
  //   @Query() queryInvoice: QueryInvoiceDto,
  //   @Query() paginateOptions: PaginationDto,
  // ): Promise<PaginateResult<InvoiceDocument>> {
  //   return await this.invoiceService.all(req, queryInvoice, paginateOptions);
  // }
}
