import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { MongooseQueryParser } from 'mongoose-query-parser';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryCostSimulatorDto } from './dto/query-cost-simulator.dto';
import { I18nContext } from 'nestjs-i18n';
import { RawMaterial, RawMaterialDocument } from './schema/raw-material.schema';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';
import { CostSimulatorHelperService } from './cost-simulator-helper.service';

@Injectable()
export class RawMaterialService {
  constructor(
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModelPag: PaginateModel<RawMaterialDocument>,
    private readonly costSimulatorHelperService: CostSimulatorHelperService,
  ) {}
  async create(
    req: any,
    dto: CreateRawMaterialDto,
  ): Promise<RawMaterialDocument> {
    let simulatedPrice = 0;
    if (dto.components?.length > 0) {
      const calculatedCost =
        await this.costSimulatorHelperService.calculateProductCost(
          dto.components,
        );
      dto.unitPrice = calculatedCost.calculatedCost / dto.quantity;
      simulatedPrice = calculatedCost.simulatedCost / dto.quantity;
    } else {
      simulatedPrice =
        dto.unitPrice - (dto.unitPrice * (dto.changeSimulation ?? 0)) / 100;
    }

    return await this.rawMaterialModel.create({
      ...dto,
      simulatedPrice,
      totalPrice: dto.unitPrice * dto.quantity,
    });
  }

  async findAll(
    req: any,
    query: QueryCostSimulatorDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<RawMaterialDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.rawMaterialModelPag.paginate(
      {
        ...queryToApply,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
        populate: [
          {
            path: 'uom',
            select: {
              name: 1,
              nameAr: 1,
              _id: 1,
            },
          },
          {
            path: 'components.materialId',
            populate: [
              {
                path: 'components.materialId',
                select: {
                  name: 1,
                  nameAr: 1,
                  uom: 1,
                  unitPrice: 1,
                },
              },
              {
                path: 'components.uom',
                select: {
                  name: 1,
                  nameAr: 1,
                  _id: 1,
                },
              },
            ],
            select: {
              name: 1,
              nameAr: 1,
              uom: 1,
              unitPrice: 1,
            },
          },
          {
            path: 'components.uom',
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
    rawMaterialId: string,
    i18n: I18nContext,
  ): Promise<RawMaterialDocument> {
    const exists = await this.rawMaterialModel.findById(rawMaterialId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    rawMaterialId: string,
    dto: UpdateRawMaterialDto,
    i18n: I18nContext,
  ): Promise<RawMaterialDocument> {
    let simulatedPrice = 0;
    if (dto.components?.length > 0) {
      const calculatedCost =
        await this.costSimulatorHelperService.calculateProductCost(
          dto.components,
        );
      dto.unitPrice = calculatedCost.calculatedCost / dto.quantity;
      simulatedPrice = calculatedCost.simulatedCost / dto.quantity;
    } else {
      simulatedPrice =
        dto.unitPrice - (dto.unitPrice * (dto.changeSimulation ?? 0)) / 100;
    }
    const rawMaterial = await this.rawMaterialModel.findByIdAndUpdate(
      rawMaterialId,
      { ...dto, simulatedPrice, totalPrice: dto.unitPrice * dto.quantity },
      {
        new: true,
      },
    );

    if (!rawMaterial) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    this.costSimulatorHelperService.applyMaterialChangeToMaterial(rawMaterial);
    return rawMaterial;
  }

  async remove(rawMaterialId: string, i18n: I18nContext): Promise<boolean> {
    const rawMaterial = await this.rawMaterialModel.findByIdAndDelete(
      rawMaterialId,
    );

    if (!rawMaterial) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
