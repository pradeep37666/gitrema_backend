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
import { ProductionEventService } from './production-event.service';
import { CreateProductionEventDto } from './dto/create-production-event.dto';
import { UpdateProductionEventDto } from './dto/update-production-event.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { QueryProductionEventDto } from './dto/query-production-event.dto';
import { PaginateResult } from 'mongoose';
import { PaginationDto } from 'src/core/Constants/pagination';
import { ProductionEventDocument } from './schema/production-event.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('production-event')
@ApiTags('Production Events')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ProductionEventController {
  constructor(
    private readonly productionEventService: ProductionEventService,
  ) {}

  @Post()
  @PermissionGuard(PermissionSubject.ProductionEvent, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateProductionEventDto) {
    return await this.productionEventService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.ProductionEvent, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryProductionEventDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ProductionEventDocument>> {
    return await this.productionEventService.findAll(
      req,
      query,
      paginateOptions,
    );
  }

  @Get(':productionEventId')
  @PermissionGuard(PermissionSubject.ProductionEvent, Permission.Common.FETCH)
  async findOne(
    @Param('productionEventId') productionEventId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.productionEventService.findOne(productionEventId, i18n);
  }

  // @Patch(':productionEventId')
  // @PermissionGuard(PermissionSubject.ProductionEvent, Permission.Common.UPDATE)
  // async update(
  //   @Param('productionEventId') productionEventId: string,
  //   @Body() dto: UpdateProductionEventDto,
  //   @I18n() i18n: I18nContext,
  // ) {
  //   return await this.productionEventService.update(
  //     productionEventId,
  //     dto,
  //     i18n,
  //   );
  // }

  // @Delete(':productionEventId')
  // @PermissionGuard(PermissionSubject.ProductionEvent, Permission.Common.DELETE)
  // async remove(
  //   @Param('productionEventId') productionEventId: string,
  //   @I18n() i18n: I18nContext,
  // ) {
  //   return await this.productionEventService.remove(productionEventId, i18n);
  // }
}
