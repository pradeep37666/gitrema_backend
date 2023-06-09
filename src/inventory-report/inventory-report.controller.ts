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
import { InventoryReportService } from './inventory-report.service';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { MaterialPriceReportDto } from './dto/material-price-report.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { SelectedVendorDocument } from 'src/selected-vendor/schema/selected-vendor.schema';
import { PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { CostReportDto } from './dto/cost-report.dto';

@Controller('inventory-report')
@ApiTags('Invoice Reports')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class InventoryReportController {
  constructor(
    private readonly inventoryReportService: InventoryReportService,
  ) {}

  @Get('material-price')
  //@PermissionGuard(PermissionSubject.InvoiceReceipt, Permission.Common.LIST)
  async materialPrice(
    @Req() req,
    @Query() query: MaterialPriceReportDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<SelectedVendorDocument>> {
    return await this.inventoryReportService.materialPriceReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('material-cost')
  //@PermissionGuard(PermissionSubject.InvoiceReceipt, Permission.Common.LIST)
  async materialCost(@Req() req, @Query() query: CostReportDto): Promise<any> {
    return await this.inventoryReportService.costReport(req, query);
  }
}
