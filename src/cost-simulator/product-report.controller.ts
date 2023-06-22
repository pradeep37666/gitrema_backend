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

import { QueryCostSimulatorDto } from './dto/query-cost-simulator.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { CostSimulatorDocument } from './schema/cost-simulator.schema';
import { PaginateResult } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Public } from 'src/core/decorators/public.decorator';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ProductReportService } from './product-report.service';
import { CreateProductReportDto } from './dto/create-product-report.dto';
import { ProductReportDocument } from './schema/product-report.schema';

@Controller('cost-simulator/reports')
@Public()
@ApiTags('Cost Simulator - Reports')
@ApiHeader({ name: 'lang' })
export class ProductReportController {
  constructor(private readonly productReportService: ProductReportService) {}

  @Post()
  async create(
    @Req() req,
    @Body() dto: CreateProductReportDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.productReportService.create(req, dto, i18n);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query() query: QueryCostSimulatorDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ProductReportDocument>> {
    return await this.productReportService.findAll(req, query, paginateOptions);
  }

  @Get(':productReportId')
  async findOne(
    @Param('productReportId') productReportId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.productReportService.findOne(productReportId, i18n);
  }

  @Patch(':productReportId')
  async update(
    @Param('productReportId') productReportId: string,
    @Body() dto: CreateProductReportDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.productReportService.update(productReportId, dto, i18n);
  }

  @Delete(':productReportId')
  async remove(
    @Param('productReportId') productReportId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.productReportService.remove(productReportId, i18n);
  }
}
