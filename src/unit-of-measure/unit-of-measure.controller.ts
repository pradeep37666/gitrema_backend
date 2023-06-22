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
import { UnitOfMeasureService } from './unit-of-measure.service';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/update-unit-of-measure.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { QueryUnitOfMeasureDto } from './dto/query-unit-of-measure.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { UnitOfMeasureDocument } from './schemas/unit-of-measure.schema';
import { PaginateResult } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/core/decorators/public.decorator';
import { ConvertUomDto } from './dto/convert-uom.dto';

@Controller('unit-of-measure')
@ApiTags('Unit of Measure')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class UnitOfMeasureController {
  constructor(private readonly unitOfMeasureService: UnitOfMeasureService) {}

  @Post()
  @PermissionGuard(PermissionSubject.UnitOfMeasure, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateUnitOfMeasureDto) {
    return await this.unitOfMeasureService.create(req, dto);
  }

  @Get()
  @Public()
  @PermissionGuard(PermissionSubject.UnitOfMeasure, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryUnitOfMeasureDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<UnitOfMeasureDocument>> {
    return await this.unitOfMeasureService.findAll(req, query, paginateOptions);
  }

  @Get(':unitOfMeasureId')
  @PermissionGuard(PermissionSubject.UnitOfMeasure, Permission.Common.FETCH)
  async findOne(
    @Param('unitOfMeasureId') unitOfMeasureId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.unitOfMeasureService.findOne(unitOfMeasureId, i18n);
  }

  @Patch(':unitOfMeasureId')
  @PermissionGuard(PermissionSubject.UnitOfMeasure, Permission.Common.UPDATE)
  async update(
    @Param('unitOfMeasureId') unitOfMeasureId: string,
    @Body() dto: UpdateUnitOfMeasureDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.unitOfMeasureService.update(unitOfMeasureId, dto, i18n);
  }

  @Delete(':unitOfMeasureId')
  @PermissionGuard(PermissionSubject.UnitOfMeasure, Permission.Common.DELETE)
  async remove(
    @Param('unitOfMeasureId') unitOfMeasureId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.unitOfMeasureService.remove(unitOfMeasureId, i18n);
  }

  @Post('convert')
  async convert(@Req() req, @Body() dto: ConvertUomDto) {
    return await this.unitOfMeasureService.convert(dto);
  }

  @Get('loadunits')
  @Public()
  async loadUnits() {
    this.unitOfMeasureService.loadSystemUoms();
  }
}
