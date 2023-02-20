import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import {
  MenuAddition,
  MenuAdditionDocument,
} from '../schemas/menu-addition.schema';
import {
  CreateMenuAdditionDTO,
  UpdateMenuAdditionDTO,
} from '../dto/menu-addition.dto';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';

@Injectable()
export class MenuAdditionService {
  constructor(
    @InjectModel(MenuAddition.name)
    private readonly menuAdditionModel: Model<MenuAdditionDocument>,
    @InjectModel(MenuAddition.name)
    private readonly menuAdditionModelPag: PaginateModel<MenuAdditionDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateMenuAdditionDTO,
  ): Promise<MenuAdditionDocument> {
    const supplier = await this.supplierModel.findById(req.user.supplierId);

    if (supplier.taxEnabled) {
      dto.taxEnabled = true;
    }

    return await this.menuAdditionModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<MenuAdditionDocument>> {
    const menuAdditions = await this.menuAdditionModelPag.paginate(
      {
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
    return menuAdditions;
  }

  async findOne(menuAdditionId: string): Promise<MenuAdditionDocument> {
    const exists = await this.menuAdditionModel.findById(menuAdditionId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    menuAdditionId: string,
    dto: UpdateMenuAdditionDTO,
  ): Promise<MenuAdditionDocument> {
    const menuAddition = await this.menuAdditionModel.findByIdAndUpdate(
      menuAdditionId,
      dto,
      {
        new: true,
      },
    );

    if (!menuAddition) {
      throw new NotFoundException();
    }

    return menuAddition;
  }

  async remove(menuAdditionId: string): Promise<boolean> {
    const menuAddition = await this.menuAdditionModel.findByIdAndUpdate(
      menuAdditionId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!menuAddition) {
      throw new NotFoundException();
    }
    return true;
  }
}
