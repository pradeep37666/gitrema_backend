import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCostSimulatorDto } from './dto/create-cost-simulator.dto';
import { UpdateCostSimulatorDto } from './dto/update-cost-simulator.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  CostSimulator,
  CostSimulatorDocument,
} from './schema/cost-simulator.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { MongooseQueryParser } from 'mongoose-query-parser';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { QueryCostSimulatorDto } from './dto/query-cost-simulator.dto';
import { I18nContext } from 'nestjs-i18n';
import { CostSimulatorHelperService } from './cost-simulator-helper.service';

@Injectable()
export class CostSimulatorService {
  constructor(
    @InjectModel(CostSimulator.name)
    private readonly costSimulatorModel: Model<CostSimulatorDocument>,
    @InjectModel(CostSimulator.name)
    private readonly costSimulatorModelPag: PaginateModel<CostSimulatorDocument>,
    private readonly costSimulatorHelperService: CostSimulatorHelperService,
  ) {}
  async create(
    req: any,
    dto: CreateCostSimulatorDto,
  ): Promise<CostSimulatorDocument> {
    let calculatedCost =
      await this.costSimulatorHelperService.calculateProductCost(
        dto.components,
      );
    calculatedCost = {
      calculatedCost: calculatedCost.calculatedCost / dto.perQuantity,
      simulatedCost: calculatedCost.simulatedCost / dto.perQuantity,
    };
    const profitDetails =
      await this.costSimulatorHelperService.calculateProfitDetails(
        calculatedCost,
        dto.sellPrice,
        dto.perQuantity,
      );
    const costSimulator = await this.costSimulatorModel.create({
      ...dto,
      ...calculatedCost,
      ...profitDetails,
    });

    return costSimulator;
  }

  async findAll(
    req: any,
    query: QueryCostSimulatorDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<CostSimulatorDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.costSimulatorModelPag.paginate(
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
    costSimulatorId: string,
    i18n: I18nContext,
  ): Promise<CostSimulatorDocument> {
    const exists = await this.costSimulatorModel.findById(costSimulatorId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    costSimulatorId: string,
    dto: UpdateCostSimulatorDto,
    i18n: I18nContext,
  ): Promise<CostSimulatorDocument> {
    let calculatedCost =
      await this.costSimulatorHelperService.calculateProductCost(
        dto.components,
      );
    calculatedCost = {
      calculatedCost: calculatedCost.calculatedCost / dto.perQuantity,
      simulatedCost: calculatedCost.simulatedCost / dto.perQuantity,
    };
    const profitDetails =
      await this.costSimulatorHelperService.calculateProfitDetails(
        calculatedCost,
        dto.sellPrice,
        dto.perQuantity,
      );

    const costSimulator = await this.costSimulatorModel.findByIdAndUpdate(
      costSimulatorId,
      { ...dto, ...calculatedCost, ...profitDetails },
      {
        new: true,
      },
    );

    if (!costSimulator) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return costSimulator;
  }

  async remove(costSimulatorId: string, i18n: I18nContext): Promise<boolean> {
    const costSimulator = await this.costSimulatorModel.findByIdAndDelete(
      costSimulatorId,
    );

    if (!costSimulator) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
