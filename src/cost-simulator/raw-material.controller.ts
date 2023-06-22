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

import { CreateCostSimulatorDto } from './dto/create-cost-simulator.dto';
import { UpdateCostSimulatorDto } from './dto/update-cost-simulator.dto';
import { QueryCostSimulatorDto } from './dto/query-cost-simulator.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { CostSimulatorDocument } from './schema/cost-simulator.schema';
import { PaginateResult } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Public } from 'src/core/decorators/public.decorator';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { RawMaterialService } from './raw-material.service';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { RawMaterialDocument } from './schema/raw-material.schema';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';

@Controller('cost-simulator/materials')
@Public()
@ApiTags('Cost Simulator - Materials')
@ApiHeader({ name: 'lang' })
export class RawMaterialController {
  constructor(private readonly rawMaterialService: RawMaterialService) {}

  @Post()
  async create(@Req() req, @Body() dto: CreateRawMaterialDto) {
    return await this.rawMaterialService.create(req, dto);
  }

  @Get()
  async findAll(
    @Req() req,
    @Query() query: QueryCostSimulatorDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RawMaterialDocument>> {
    return await this.rawMaterialService.findAll(req, query, paginateOptions);
  }

  @Get(':rawMaterialId')
  async findOne(
    @Param('rawMaterialId') rawMaterialId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.rawMaterialService.findOne(rawMaterialId, i18n);
  }

  @Patch(':rawMaterialId')
  async update(
    @Param('rawMaterialId') rawMaterialId: string,
    @Body() dto: UpdateRawMaterialDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.rawMaterialService.update(rawMaterialId, dto, i18n);
  }

  @Delete(':rawMaterialId')
  async remove(
    @Param('rawMaterialId') rawMaterialId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.rawMaterialService.remove(rawMaterialId, i18n);
  }
}
