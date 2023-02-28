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
import { ReportOrderUserDto } from './dto/report-order-user.dto';
import { ReportOrderLifeCycleDto } from './dto/report-order-live-cycle.dto';
import { ReportReservationDto } from './dto/report-reservation.dto';
import { ReservationDocument } from 'src/reservation/schemas/reservation.schema';
import { ReportOrderKitchenDto } from './dto/report-order-kitchen.dto';

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
  async generalReportExport(
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

  @Get('order/user')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async userReport(
    @Req() req,
    @Query() query: ReportOrderUserDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<AggregatePaginateResult<OrderDocument>> {
    return await this.reportService.populateOrderUserReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('order/user/export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async userReportExport(
    @Req() req,
    @Query() query: ReportOrderUserDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    return await this.reportService.exportOrderUserReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('order/live-cycle')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async orderLifeCycleReport(
    @Req() req,
    @Query() query: ReportOrderLifeCycleDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<[AggregatePaginateResult<OrderDocument>, any]> {
    return await this.reportService.populateOrderLifeCycleReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('order/live-cycle/export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async orderLifeCycleReportExport(
    @Req() req,
    @Query() query: ReportOrderLifeCycleDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    return await this.reportService.exportOrderLifeCycleReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('reservation')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async reservationReport(
    @Req() req,
    @Query() query: ReportReservationDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<[AggregatePaginateResult<ReservationDocument>, any]> {
    return await this.reportService.populateReservationReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('reservation/export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async reservationReportExport(
    @Req() req,
    @Query() query: ReportReservationDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    return await this.reportService.exportReservationReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('order/kitchen')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async orderKitchenReport(
    @Req() req,
    @Query() query: ReportOrderKitchenDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<[AggregatePaginateResult<OrderDocument>, any]> {
    return await this.reportService.populateOrderKitchenReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('order/kitchen/export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async orderKitchenReportExport(
    @Req() req,
    @Query() query: ReportOrderKitchenDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    return await this.reportService.exportOrderKitchenReport(
      req,
      query,
      paginateOptions,
    );
  }
}
