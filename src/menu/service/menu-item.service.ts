import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MenuItem, MenuItemDocument } from '../schemas/menu-item.schema';
import { CreateMenuItemDTO, UpdateMenuItemDTO } from '../dto/menu-item.dto';
import { QueryMenuItemDto } from '../dto/query-menu-item.dto';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModelPag: PaginateModel<MenuItemDocument>,
  ) {}

  async create(req: any, dto: CreateMenuItemDTO): Promise<MenuItemDocument> {
    return await this.menuItemModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryMenuItemDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<MenuItemDocument>> {
    const menuItems = await this.menuItemModelPag.paginate(
      {
        ...query,
        supplierId: req.user.supplierId,
        deletedAt: null,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return menuItems;
  }

  async findOne(menuItemId: string): Promise<MenuItemDocument> {
    const exists = await this.menuItemModel.findById(menuItemId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    menuItemId: string,
    dto: UpdateMenuItemDTO,
  ): Promise<MenuItemDocument> {
    const menuItem = await this.menuItemModel.findByIdAndUpdate(
      menuItemId,
      dto,
      {
        new: true,
      },
    );

    if (!menuItem) {
      throw new NotFoundException();
    }

    return menuItem;
  }

  async remove(menuItemId: string): Promise<boolean> {
    const menuItem = await this.menuItemModel.findByIdAndUpdate(
      menuItemId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!menuItem) {
      throw new NotFoundException();
    }
    return true;
  }
}
