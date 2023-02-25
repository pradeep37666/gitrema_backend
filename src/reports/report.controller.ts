import {
  Controller,
  Get,
  Req,
  Query,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { AggregatePaginateResult, PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportOrderGeneralDto } from './dto/report-order-general.dto';
import { SkipInterceptor } from 'src/core/decorators/skip-interceptor.decorator';
import { OrderDocument } from 'src/order/schemas/order.schema';

@Controller('report')
@ApiTags('Reports')
@ApiBearerAuth('access-token')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('order/general')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async generalReport(
    @Req() req,
    @Query() query: ReportOrderGeneralDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<[AggregatePaginateResult<OrderDocument>, any]> {
    return await this.reportService.populateOrderGeneralReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('order/general/export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async generalReportExportCsv(
    @Req() req,
    @Query() query: ReportOrderGeneralDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    return await this.reportService.exportOrderGeneralReport(
      req,
      query,
      paginateOptions,
    );
  }
}
