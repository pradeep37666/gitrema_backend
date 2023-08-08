import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  Req,
} from '@nestjs/common';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';
import { PaginationDto } from 'src/core/Constants/pagination';
import { PaginateResult } from 'mongoose';
import { MenuItemService } from '../service/menu-item.service';
import { CreateMenuItemDTO, HideFromMarketDto, UpdateMenuItemDTO } from '../dto/menu-item.dto';
import { HideFromMarket, MenuItemDocument } from '../schemas/menu-item.schema';
import { QueryMenuItemDto } from '../dto/query-menu-item.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('menu-item')
@ApiTags('Menu Items')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  @PermissionGuard(PermissionSubject.MenuItem, Permission.Common.CREATE)
  async create(@Req() req, @Body() createMenuItemDTO: CreateMenuItemDTO) {
    return await this.menuItemService.create(req, createMenuItemDTO);
  }

  @Get()
  @PermissionGuard(PermissionSubject.MenuItem, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() query: QueryMenuItemDto,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<MenuItemDocument>> {
    return await this.menuItemService.findAll(req, query, paginateOptions);
  }

  @Get(':menuItemId')
  @PermissionGuard(PermissionSubject.MenuItem, Permission.Common.FETCH)
  async findOne(@Param('menuItemId') menuItemId: string) {
    return await this.menuItemService.findOne(menuItemId);
  }

  @Patch(':menuItemId')
  @PermissionGuard(PermissionSubject.MenuItem, Permission.Common.UPDATE)
  async update(
    @Param('menuItemId') menuItemId: string,
    @Body() updateMenuItemDTO: UpdateMenuItemDTO,
  ) {
    return await this.menuItemService.update(menuItemId, updateMenuItemDTO);
  }

  @Delete(':menuItemId')
  @PermissionGuard(PermissionSubject.MenuItem, Permission.Common.DELETE)
  async remove(@Param('menuItemId') menuItemId: string) {
    return await this.menuItemService.remove(menuItemId);
  }
}
