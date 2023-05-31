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
import {
  CustomerCondition,
  CustomerConditionDocument,
} from 'src/customer-condition/schema/customer-condition.schema';
import {
  SelectedVendor,
  SelectedVendorDocument,
} from 'src/selected-vendor/schema/selected-vendor.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';

@Injectable()
export class VendorMaterialService {
  constructor(
    @InjectModel(VendorMaterial.name)
    private readonly vendorMaterialModel: Model<VendorMaterialDocument>,
    @InjectModel(VendorMaterial.name)
    private readonly vendorMaterialModelPag: PaginateModel<VendorMaterialDocument>,
    @InjectModel(CustomerCondition.name)
    private readonly customerConditionModel: Model<CustomerConditionDocument>,
    @InjectModel(SelectedVendor.name)
    private readonly selectedVendorModel: Model<SelectedVendorDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateVendorMaterialDto,
  ): Promise<VendorMaterialDocument> {
    return await this.vendorMaterialModel.create({
      ...dto,
      vendorId: req.user.supplierId,
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
        vendorId: req.user.supplierId,
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
    if (dto.cost) {
      this.afterPriceUpdate(vendorMaterial);
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

  async afterPriceUpdate(vendorMaterial: VendorMaterialDocument) {
    const customerConditions = await this.customerConditionModel.find({
      vendorMaterialId: vendorMaterial._id,
    });
    const vendorInfoRecords = await this.selectedVendorModel.find({
      vendorMaterialId: vendorMaterial._id,
      restaurantId: {
        $nin: customerConditions.map((cc) => {
          return cc.restaurantId;
        }),
      },
    });
    for (const i in vendorInfoRecords) {
      let conversionFactor = 1;
      if (
        vendorInfoRecords[i].uom.toString() != vendorMaterial.uomSell.toString()
      ) {
        try {
          const convert =
            await this.unitOfMeasureHelperService.getConversionFactor(
              vendorMaterial.uomSell,
              vendorInfoRecords[i].uom,
            );
          conversionFactor = convert.conversionFactor;
        } catch (err) {
          console.error(err);
        }
      }
      const calculatedCost =
        (vendorInfoRecords[i].quantity * vendorMaterial.cost) /
        (vendorMaterial.quantity * conversionFactor);

      vendorInfoRecords[i].cost = calculatedCost;

      vendorInfoRecords[i].save();
    }
  }
}
