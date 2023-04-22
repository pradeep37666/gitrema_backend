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
import { MenuCategoryService } from '../service/menu-category.service';
import {
  CreateMenuCategoryDTO,
  UpdateMenuCategoryDTO,
} from '../dto/menu-category.dto';
import { MenuCategoryDocument } from '../schemas/menu-category.schema';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';

@Controller('menu-category')
@ApiTags('Menu Categories')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  @Post()
  @PermissionGuard(PermissionSubject.MenuCategory, Permission.Common.CREATE)
  async create(
    @Req() req,
    @Body() createMenuCategoryDTO: CreateMenuCategoryDTO,
  ) {
    return await this.menuCategoryService.create(req, createMenuCategoryDTO);
  }

  @Get()
  @PermissionGuard(PermissionSubject.MenuCategory, Permission.Common.LIST)
  async findAll(
    @Req() req,
    @Query() paginateOptions: PaginationDto,
  ): Promise<PaginateResult<MenuCategoryDocument>> {
    return await this.menuCategoryService.findAll(req, paginateOptions);
  }

  @Get(':menuCategoryId')
  @PermissionGuard(PermissionSubject.MenuCategory, Permission.Common.FETCH)
  async findOne(@Param('menuCategoryId') menuCategoryId: string) {
    return await this.menuCategoryService.findOne(menuCategoryId);
  }

  @Patch(':menuCategoryId')
  @PermissionGuard(PermissionSubject.MenuCategory, Permission.Common.UPDATE)
  async update(
    @Param('menuCategoryId') menuCategoryId: string,
    @Body() updateMenuCategoryDTO: UpdateMenuCategoryDTO,
  ) {
    return await this.menuCategoryService.update(
      menuCategoryId,
      updateMenuCategoryDTO,
    );
  }

  @Delete(':menuCategoryId')
  @PermissionGuard(PermissionSubject.MenuCategory, Permission.Common.DELETE)
  async remove(@Param('menuCategoryId') menuCategoryId: string) {
    return await this.menuCategoryService.remove(menuCategoryId);
  }
}
