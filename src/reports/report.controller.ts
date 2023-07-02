import {
  Controller,
  Get,
  Req,
  Query,
  Header,
  StreamableFile,
  Post,
  Body,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { AggregatePaginateResult, PaginateResult } from 'mongoose';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ReportOrderGeneralDto } from './dto/report-order-general.dto';
import { SkipInterceptor } from 'src/core/decorators/skip-interceptor.decorator';
import { OrderDocument } from 'src/order/schemas/order.schema';
import { ReportOrderUserDto } from './dto/report-order-user.dto';
import { ReportOrderLifeCycleDto } from './dto/report-order-live-cycle.dto';
import { ReportReservationDto } from './dto/report-reservation.dto';
import { ReservationDocument } from 'src/reservation/schemas/reservation.schema';
import { ReportOrderKitchenDto } from './dto/report-order-kitchen.dto';
import { TransactionDocument } from 'src/transaction/schemas/transactions.schema';
import { ReportPaymentDto } from './dto/report-payment.dto';
import { PayoutPreviewDto } from './dto/payout-preview.dto';
import {
  SalesReportDto,
  SalesTrendReportDailyDto,
} from './dto/sales-report.dto';
import { SalesReportService } from './sales-report.service';
import { PaymentReportService } from './payment-report.service';

@Controller('report')
@ApiTags('Reports')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly salesReportService: SalesReportService,
    private readonly paymentReportService: PaymentReportService,
  ) {}

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

  @Get('payment/refund')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async paymentRefundReport(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<AggregatePaginateResult<TransactionDocument>> {
    return await this.reportService.populatePaymentRefundReport(
      req,
      paginateOptions,
    );
  }

  @Get('payment/refund/export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async paymentRefundReportExport(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    return await this.reportService.exportPaymentRefundReport(
      req,
      paginateOptions,
    );
  }

  @Get('payment')
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async paymentReport(
    @Req() req,
    @Query() query: ReportPaymentDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<[AggregatePaginateResult<TransactionDocument>, any]> {
    return await this.reportService.populatePaymentReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('payment/export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="transactions.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Order, Permission.Common.LIST)
  async paymentReportExport(
    @Req() req,
    @Query() query: ReportPaymentDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<StreamableFile> {
    return await this.reportService.exportPaymentReport(
      req,
      query,
      paginateOptions,
    );
  }

  @Get('payout/preview')
  @PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async payoutPreview(@Req() req, @Query() query: PayoutPreviewDto) {
    return await this.reportService.exportPayoutPreview(req, query, false);
  }

  @Get('payout/preview-export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="payout.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async payoutPreviewExport(@Req() req, @Query() query: PayoutPreviewDto) {
    return await this.reportService.exportPayoutPreview(req, query);
  }

  @Get('payout/aggregated-preview')
  @PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async payoutAggregatedPreview(@Req() req, @Query() query: PayoutPreviewDto) {
    return await this.reportService.exportPayoutAggregatePreview(
      req,
      query,
      false,
    );
  }

  @Get('payout/aggregated-preview-export')
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="payout.xlsx"')
  @SkipInterceptor()
  @PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async payoutAggregatedPreviewExport(
    @Req() req,
    @Query() query: PayoutPreviewDto,
  ) {
    return await this.reportService.exportPayoutAggregatePreview(req, query);
  }

  @Post('sales-summary')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async salesPreview(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.salesSummary(req, dto);
  }
  @Post('hourly-sales-summary')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async hourlySaleSummary(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.salesSummaryHourlyData(req, dto);
  }

  @Post('daily-sales-trend')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async dailySaleTrend(@Req() req, @Body() dto: SalesTrendReportDailyDto) {
    return await this.salesReportService.dailySalesTrend(req, dto);
  }

  @Post('weekly-sales-trend')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async weeklySaleTrend(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.weeklySalesTrend(req, dto);
  }

  @Post('yearly-sales-trend')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async yearlySaleTrend(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.yearlySalesTrend(req, dto);
  }

  @Post('payments-by-paymentmethod')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async paymentReportByPaymentMethod(@Req() req, @Body() dto: SalesReportDto) {
    return await this.paymentReportService.paymentByPaymentMethod(req, dto);
  }

  @Post('item-sales')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async itemSales(@Req() req, @Body() dto: SalesTrendReportDailyDto) {
    return await this.salesReportService.itemSaleReport(req, dto);
  }
  @Post('item-sales-hourly')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async itemSalesHourly(@Req() req, @Body() dto: SalesTrendReportDailyDto) {
    return await this.salesReportService.itemSaleHourlyReport(req, dto);
  }

  @Post('category-sales')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async categorySales(@Req() req, @Body() dto: SalesTrendReportDailyDto) {
    return await this.salesReportService.categorySaleReport(req, dto);
  }
  @Post('category-sales-hourly')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async categorySalesHourly(@Req() req, @Body() dto: SalesTrendReportDailyDto) {
    return await this.salesReportService.categorySaleHourlyReport(req, dto);
  }

  @Post('addition-sales')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async additionSales(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.additionSaleReport(req, dto);
  }

  @Post('team-sales')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async teamSales(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.teamSalesReport(req, dto);
  }

  @Post('discount-sales')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async discountSales(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.discountSalesReport(req, dto);
  }

  @Post('sales-tax')
  //@PermissionGuard(PermissionSubject.Report, Permission.Report.PayoutPreview)
  async salesTax(@Req() req, @Body() dto: SalesReportDto) {
    return await this.salesReportService.salesTaxReport(req, dto);
  }
}
