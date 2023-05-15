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
import { InventoryCountService } from './inventory-count.service';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { UpdateInventoryCountDto } from './dto/update-inventory-count.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { QueryInventoryCountDto } from './dto/query-inventory-count.dto';
import { PaginateResult } from 'mongoose';
import { PaginationDto } from 'src/core/Constants/pagination';

import { InventoryCountDocument } from './schema/inventory-count.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { InventoryCountStatus } from './enum/en';

@Controller('inventory-count')
@ApiTags('Inventory Count')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class InventoryCountController {
  constructor(private readonly inventoryCountService: InventoryCountService) {}

  @Post()
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateInventoryCountDto) {
    return await this.inventoryCountService.create(req, dto);
  }

  @Get()
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryInventoryCountDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InventoryCountDocument>> {
    return await this.inventoryCountService.findAll(
      req,
      query,
      paginateOptions,
    );
  }

  @Get(':inventoryCountId')
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.FETCH)
  async findOne(
    @Param('inventoryCountId') inventoryCountId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryCountService.findOne(inventoryCountId, i18n);
  }

  @Patch(':inventoryCountId')
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.UPDATE)
  async update(
    @Param('inventoryCountId') inventoryCountId: string,
    @Body() dto: UpdateInventoryCountDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryCountService.update(inventoryCountId, dto, i18n);
  }

  @Post(':inventoryCountId/lock')
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.UPDATE)
  async lock(
    @Param('inventoryCountId') inventoryCountId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryCountService.changeStatus(
      inventoryCountId,
      InventoryCountStatus.Locked,
      i18n,
    );
  }

  @Post(':inventoryCountId/accept')
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.UPDATE)
  async accept(
    @Param('inventoryCountId') inventoryCountId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryCountService.applyInventoryCount(
      inventoryCountId,

      i18n,
    );
  }

  @Post(':inventoryCountId/reject')
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.UPDATE)
  async reject(
    @Param('inventoryCountId') inventoryCountId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryCountService.changeStatus(
      inventoryCountId,
      InventoryCountStatus.Rejected,
      i18n,
    );
  }

  @Delete(':inventoryCountId')
  @PermissionGuard(PermissionSubject.InventoryCount, Permission.Common.DELETE)
  async remove(
    @Param('inventoryCountId') inventoryCountId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryCountService.remove(inventoryCountId, i18n);
  }
}
