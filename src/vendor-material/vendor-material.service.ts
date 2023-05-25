import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorMaterialDto } from './dto/create-vendor-material.dto';
import { UpdateVendorMaterialDto } from './dto/update-vendor-material.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';

import { Model, PaginateModel, PaginateResult } from 'mongoose';
import {
  VendorMaterial,
  VendorMaterialDocument,
} from './schemas/vendor-material.schema';
import { InjectModel } from '@nestjs/mongoose';
import { QueryVendorMaterialDto } from './dto/query-vendor-material.dto';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class VendorMaterialService {
  constructor(
    @InjectModel(VendorMaterial.name)
    private readonly vendorMaterialModel: Model<VendorMaterialDocument>,
    @InjectModel(VendorMaterial.name)
    private readonly vendorMaterialModelPag: PaginateModel<VendorMaterialDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateVendorMaterialDto,
  ): Promise<VendorMaterialDocument> {
    return await this.vendorMaterialModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryVendorMaterialDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<VendorMaterialDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.vendorMaterialModelPag.paginate(
      {
        ...queryToApply,
        supplierId: req.user.supplierId,
        deletedAt: null,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'uomSell',
            select: {
              name: 1,
              nameAr: 1,
              _id: 1,
            },
          },
        ],
      },
    );
    return records;
  }

  async findOne(
    vendorMaterialId: string,
    i18n: I18nContext,
  ): Promise<VendorMaterialDocument> {
    const exists = await this.vendorMaterialModel.findById(vendorMaterialId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    vendorMaterialId: string,
    dto: UpdateVendorMaterialDto,
    i18n: I18nContext,
  ): Promise<VendorMaterialDocument> {
    const vendorMaterial = await this.vendorMaterialModel.findByIdAndUpdate(
      vendorMaterialId,
      dto,
      {
        new: true,
      },
    );

    if (!vendorMaterial) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return vendorMaterial;
  }

  async remove(vendorMaterialId: string, i18n: I18nContext): Promise<boolean> {
    const vendorMaterial = await this.vendorMaterialModel.findByIdAndUpdate(
      vendorMaterialId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!vendorMaterial) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
