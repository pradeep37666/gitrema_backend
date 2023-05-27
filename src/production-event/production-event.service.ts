import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductionEventDto } from './dto/create-production-event.dto';
import { UpdateProductionEventDto } from './dto/update-production-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProductionEvent,
  ProductionEventDocument,
} from './schema/production-event.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryProductionEventDto } from './dto/query-production-event.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import { ProductionEventHelperService } from './production-event-helper.service';

@Injectable()
export class ProductionEventService {
  constructor(
    @InjectModel(ProductionEvent.name)
    private readonly productionEventModel: Model<ProductionEventDocument>,
    @InjectModel(ProductionEvent.name)
    private readonly productionEventModelPag: PaginateModel<ProductionEventDocument>,
    private readonly productionEventHelperService: ProductionEventHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateProductionEventDto,
  ): Promise<ProductionEventDocument> {
    const productionEvent = await this.productionEventModel.create({
      ...dto,

      addedBy: req.user.userId,
      supplierId: req.user.supplierId,
    });

    const preparedData = await this.productionEventHelperService.executeRecipe(
      productionEvent,
      dto,
    );
    productionEvent.set({ ...preparedData, isApplied: true });
    productionEvent.save();

    return productionEvent;
  }

  async findAll(
    req: any,
    query: QueryProductionEventDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<ProductionEventDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.productionEventModelPag.paginate(
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

  async findOne(
    productionEventId: string,
    i18n: I18nContext,
  ): Promise<ProductionEventDocument> {
    const exists = await this.productionEventModel.findById(productionEventId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    productionEventId: string,
    dto: UpdateProductionEventDto,
    i18n: I18nContext,
  ): Promise<ProductionEventDocument> {
    const productionEvent = await this.productionEventModel.findByIdAndUpdate(
      productionEventId,
      dto,
      {
        new: true,
      },
    );

    if (!productionEvent) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return productionEvent;
  }

  async remove(productionEventId: string, i18n: I18nContext): Promise<boolean> {
    const productionEvent = await this.productionEventModel.findByIdAndDelete(
      productionEventId,
    );

    if (!productionEvent) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }
}
