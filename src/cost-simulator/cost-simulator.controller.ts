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
import { CostSimulatorService } from './cost-simulator.service';
import { CreateCostSimulatorDto } from './dto/create-cost-simulator.dto';
import { UpdateCostSimulatorDto } from './dto/update-cost-simulator.dto';
import { QueryCostSimulatorDto } from './dto/query-cost-simulator.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { CostSimulatorDocument } from './schema/cost-simulator.schema';
import { PaginateResult } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Public } from 'src/core/decorators/public.decorator';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('cost-simulator/products')
@Public()
@ApiTags('Cost Simulator - Products')
@ApiHeader({ name: 'lang' })
export class CostSimulatorController {
  constructor(private readonly costSimulatorService: CostSimulatorService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateCostSimulatorDto) {
    return await this.costSimulatorService.create(req, dto);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query() query: QueryCostSimulatorDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CostSimulatorDocument>> {
    return await this.costSimulatorService.findAll(req, query, paginateOptions);
  }

  @Get(':costSimulatorId')
  async findOne(
    @Param('costSimulatorId') costSimulatorId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.costSimulatorService.findOne(costSimulatorId, i18n);
  }

  @Patch(':costSimulatorId')
  async update(
    @Param('costSimulatorId') costSimulatorId: string,
    @Body() dto: UpdateCostSimulatorDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.costSimulatorService.update(costSimulatorId, dto, i18n);
  }

  @Delete(':costSimulatorId')
  async remove(
    @Param('costSimulatorId') costSimulatorId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.costSimulatorService.remove(costSimulatorId, i18n);
  }
}
