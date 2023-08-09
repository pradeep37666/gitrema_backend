import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { HideFromMarket, MenuItem, MenuItemDocument } from '../schemas/menu-item.schema';
import { CreateMenuItemDTO, HideFromMarketDto, UpdateMenuItemDTO } from '../dto/menu-item.dto';
import { QueryMenuItemDto } from '../dto/query-menu-item.dto';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModelPag: PaginateModel<MenuItemDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async create(req: any, dto: CreateMenuItemDTO): Promise<MenuItemDocument> {
    if (dto.taxEnabled !== true && dto.taxEnabled !== false) {
      const supplier = await this.supplierModel.findById(req.user.supplierId);
      dto.taxEnabled = supplier.taxEnabled ?? false;
    }
    if (dto.importId) {
      return await this.menuItemModel.findOneAndUpdate(
        { supplierId: req.user.supplierId, name: dto.name },
        {
          ...dto,
          addedBy: req.user.userId,
          supplierId: req.user.supplierId,
        },
        {
          upsert: true,
          setDefaultsOnInsert: true,
          new: true,
        },
      );
    }
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
    const queryObj: any = { ...query };
    if (query.search) {
      queryObj.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { nameAr: { $regex: query.search, $options: 'i' } },
      ];
    }
    const menuItems = await this.menuItemModelPag.paginate(
      {
        ...queryObj,
        supplierId: req.user.supplierId,
        deletedAt: null,
      },
      {
        sort: paginateOptions.sortBy
          ? {
              [paginateOptions.sortBy]: paginateOptions.sortDirection
                ? paginateOptions.sortDirection
                : -1,
            }
          : DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'uomSell',
          },
        ],
      },
    );
    return menuItems;
  }

  async findOne(menuItemId: string): Promise<MenuItemDocument> {
    const exists = await this.menuItemModel
      .findById(menuItemId)
      .populate([{ path: 'additions', match: { deletedAt: null } }]);

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
