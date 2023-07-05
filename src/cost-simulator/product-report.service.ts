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
import {
  ProductReport,
  ProductReportDocument,
} from './schema/product-report.schema';
import { CreateProductReportDto } from './dto/create-product-report.dto';

@Injectable()
export class ProductReportService {
  constructor(
    @InjectModel(ProductReport.name)
    private readonly productReportModel: Model<ProductReportDocument>,
    @InjectModel(ProductReport.name)
    private readonly productReportModelPag: PaginateModel<ProductReportDocument>,
    @InjectModel(CostSimulator.name)
    private readonly costSimulatorModel: Model<CostSimulatorDocument>,
    private readonly costSimulatorHelperService: CostSimulatorHelperService,
  ) {}
  async create(
    req: any,
    dto: CreateProductReportDto,
    i18n: I18nContext,
  ): Promise<ProductReportDocument> {
    const product = await this.costSimulatorModel.findById(dto.productId);
    if (!product) throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    const record = await this.productReportModel.create({
      ...dto,
      ...(await this.costSimulatorHelperService.calculateForReport(
        dto,
        product,
      )),
    });

    return record;
  }

  async findAll(
    req: any,
    query: QueryCostSimulatorDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ProductReportDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.productReportModelPag.paginate(
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
            path: 'productId',
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
        ],
      },
    );
    return records;
  }

  async findOne(
    productReportId: string,
    i18n: I18nContext,
  ): Promise<ProductReportDocument> {
    const exists = await this.productReportModel.findById(productReportId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    productReportId: string,
    dto: CreateProductReportDto,
    i18n: I18nContext,
  ): Promise<ProductReportDocument> {
    const product = await this.costSimulatorModel.findById(dto.productId);
    if (!product) throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    const record = await this.productReportModel.findByIdAndUpdate(
      productReportId,
      {
        ...dto,
        ...(await this.costSimulatorHelperService.calculateForReport(
          dto,
          product,
        )),
      },
      {
        new: true,
      },
    );

    if (!record) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return record;
  }

  async remove(productReportId: string, i18n: I18nContext): Promise<boolean> {
    const record = await this.productReportModel.findByIdAndDelete(
      productReportId,
    );

    if (!record) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
