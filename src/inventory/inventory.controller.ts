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
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';

import { QueryInventoryDto } from './dto/query-inventory.dto';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { InventoryDocument } from './schemas/inventory.schema';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { QueryInventoryHistoryDto } from './dto/query-inventory-history.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';

@Controller('inventory')
@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Material, Permission.Common.CREATE)
  async create(@Req() req, @Body() dto: CreateInventoryDto) {
    return await this.inventoryService.create(req, dto);
  }

  @Post('transfer')
  @PermissionGuard(PermissionSubject.Material, Permission.Common.CREATE)
  async transfer(
    @Req() req,
    @Body() dto: TransferInventoryDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryService.transferInventory(req, dto, i18n);
  }

  @Get()
  @PermissionGuard(PermissionSubject.Material, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryInventoryDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<InventoryDocument>> {
    return await this.inventoryService.findAll(req, query, paginateOptions);
  }

  @Get(':inventoryId')
  @PermissionGuard(PermissionSubject.Material, Permission.Common.FETCH)
  async findOne(
    @Param('inventoryId') inventoryId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryService.findOne(inventoryId, i18n);
  }

  @Get('history')
  @PermissionGuard(PermissionSubject.Material, Permission.Common.FETCH)
  async history(
    @Req() req,
    @Query() query: QueryInventoryHistoryDto,
    @Query() paginateOptions: PaginationDto,
  ) {
    return await this.inventoryService.fetchHistory(
      req,
      query,
      paginateOptions,
    );
  }

  @Patch(':inventoryId')
  @PermissionGuard(PermissionSubject.Material, Permission.Common.UPDATE)
  async update(
    @Param('inventoryId') inventoryId: string,
    @Body() dto: UpdateInventoryDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryService.update(inventoryId, dto, i18n);
  }

  @Delete(':inventoryId')
  @PermissionGuard(PermissionSubject.Material, Permission.Common.DELETE)
  async remove(
    @Param('inventoryId') inventoryId: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.inventoryService.remove(inventoryId, i18n);
  }
}
