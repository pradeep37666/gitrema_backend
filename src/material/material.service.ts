import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Material, MaterialDocument } from './schemas/material.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryMaterialDto } from './dto/query-material.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { I18nContext } from 'nestjs-i18n';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { RestaurantMaterialDto } from './dto/restaurant-material.dto';
import {
  RestaurantMaterial,
  RestaurantMaterialDocument,
} from './schemas/restaurant-material.schema';

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(Material.name)
    private readonly materialModelPag: PaginateModel<MaterialDocument>,
    @InjectModel(RestaurantMaterial.name)
    private readonly restaurantMaterialModel: Model<RestaurantMaterialDocument>,
    @InjectModel(RestaurantMaterial.name)
    private readonly restaurantMaterialModelPag: PaginateModel<RestaurantMaterialDocument>,
  ) {}

  async create(req: any, dto: CreateMaterialDto): Promise<MaterialDocument> {
    return await this.materialModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async additionalMaterialDetails(
    req: any,
    dto: RestaurantMaterialDto,
  ): Promise<RestaurantMaterialDocument> {
    return await this.restaurantMaterialModel.findOneAndUpdate(
      {
        restaurantId: dto.restaurantId,
        materialId: dto.materialId,
      },
      {
        ...dto,
        supplierId: req.user.supplierId,
        addedBy: req.user.userId,
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  async findRestaurantMaterials(
    req: any,
    query: QueryMaterialDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RestaurantMaterialDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.restaurantMaterialModelPag.paginate(
      {
        ...queryToApply,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return records;
  }

  async findAll(
    req: any,
    query: QueryMaterialDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<MaterialDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const materials = await this.materialModelPag.paginate(
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
      },
    );
    return materials;
  }

  async findOne(
    materialId: string,
    i18n: I18nContext,
  ): Promise<MaterialDocument> {
    const exists = await this.materialModel.findById(materialId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    materialId: string,
    dto: UpdateMaterialDto,
    i18n: I18nContext,
  ): Promise<MaterialDocument> {
    const material = await this.materialModel.findByIdAndUpdate(
      materialId,
      dto,
      {
        new: true,
      },
    );

    if (!material) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return material;
  }

  async remove(materialId: string, i18n: I18nContext): Promise<boolean> {
    const material = await this.materialModel.findByIdAndUpdate(
      materialId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!material) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
