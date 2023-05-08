import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  MenuCategory,
  MenuCategoryDocument,
} from '../schemas/menu-category.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  CreateMenuCategoryDTO,
  UpdateMenuCategoryDTO,
} from '../dto/menu-category.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryMenuCategoryDto } from '../dto/query-menu-category.dto';
import { MenuItem, MenuItemDocument } from '../schemas/menu-item.schema';

@Injectable()
export class MenuCategoryService {
  constructor(
    @InjectModel(MenuCategory.name)
    private readonly menuCategoryModel: Model<MenuCategoryDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuCategory.name)
    private readonly menuCategoryModelPag: PaginateModel<MenuCategoryDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateMenuCategoryDTO,
  ): Promise<MenuCategoryDocument> {
    return await this.menuCategoryModel.findOneAndUpdate(
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

  async findAll(
    req: any,
    query: QueryMenuCategoryDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<MenuCategoryDocument>> {
    let idFilter = {};

    if (query.fetchCategoriesHavingItems) {
      const menuItems = await this.menuItemModel.find(
        {
          supplierId: req.user.supplierId,
          deletedAt: null,
          active: true,
        },
        { categoryId: 1 },
      );

      idFilter = {
        _id: {
          $in: menuItems.map((mi) => {
            return mi.categoryId;
          }),
        },
      };
    }

    const menuCategorys = await this.menuCategoryModelPag.paginate(
      {
        supplierId: req.user.supplierId,
        deletedAt: null,
        ...idFilter,
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
      },
    );
    return menuCategorys;
  }

  async findOne(menuCategoryId: string): Promise<MenuCategoryDocument> {
    const exists = await this.menuCategoryModel.findById(menuCategoryId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    menuCategoryId: string,
    dto: UpdateMenuCategoryDTO,
  ): Promise<MenuCategoryDocument> {
    const menuCategory = await this.menuCategoryModel.findByIdAndUpdate(
      menuCategoryId,
      dto,
      {
        new: true,
      },
    );

    if (!menuCategory) {
      throw new NotFoundException();
    }

    return menuCategory;
  }

  async remove(menuCategoryId: string): Promise<boolean> {
    const menuCategory = await this.menuCategoryModel.findByIdAndUpdate(
      menuCategoryId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!menuCategory) {
      throw new NotFoundException();
    }
    return true;
  }
}
