import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUnitOfMeasureDto } from './dto/create-unit-of-measure.dto';
import { UpdateUnitOfMeasureDto } from './dto/update-unit-of-measure.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  UnitOfMeasure,
  UnitOfMeasureDocument,
} from './schemas/unit-of-measure.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { QueryUnitOfMeasureDto } from './dto/query-unit-of-measure.dto';
import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';
import { MongooseQueryParser } from 'mongoose-query-parser';
import { I18nContext } from 'nestjs-i18n';
import configureMeasurements, {
  AllMeasures,
  AllMeasuresSystems,
  AllMeasuresUnits,
  allMeasures,
} from 'convert-units';
import { ConvertUomDto } from './dto/convert-uom.dto';
import { UnitOfMeasureHelperService } from './unit-of-measure-helper.service';
import * as convert from 'convert-units';

@Injectable()
export class UnitOfMeasureService {
  constructor(
    @InjectModel(UnitOfMeasure.name)
    private readonly unitOfMeasureModel: Model<UnitOfMeasureDocument>,
    @InjectModel(UnitOfMeasure.name)
    private readonly unitOfMeasureModelPag: PaginateModel<UnitOfMeasureDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async create(
    req: any,
    dto: CreateUnitOfMeasureDto,
  ): Promise<UnitOfMeasureDocument> {
    return await this.unitOfMeasureModel.create({
      ...dto,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryUnitOfMeasureDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<UnitOfMeasureDocument>> {
    let queryToApply: any = query;
    if (query.filter) {
      //delete queryToApply.filter;
      const parser = new MongooseQueryParser();
      const parsed = parser.parse(`${query.filter}`);
      queryToApply = { ...queryToApply, ...parsed.filter };
    }
    const records = await this.unitOfMeasureModelPag.paginate(
      {
        ...queryToApply,
        supplierId: { $in: [req.user.supplierId, null] },
        deletedAt: null,
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
    unitOfMeasureId: string,
    i18n: I18nContext,
  ): Promise<UnitOfMeasureDocument> {
    const exists = await this.unitOfMeasureModel.findById(unitOfMeasureId);

    if (!exists) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return exists;
  }

  async update(
    unitOfMeasureId: string,
    dto: UpdateUnitOfMeasureDto,
    i18n: I18nContext,
  ): Promise<UnitOfMeasureDocument> {
    const unitOfMeasure = await this.unitOfMeasureModel.findByIdAndUpdate(
      unitOfMeasureId,
      dto,
      {
        new: true,
      },
    );

    if (!unitOfMeasure) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }

    return unitOfMeasure;
  }

  async remove(unitOfMeasureId: string, i18n: I18nContext): Promise<boolean> {
    const unitOfMeasure = await this.unitOfMeasureModel.findByIdAndUpdate(
      unitOfMeasureId,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!unitOfMeasure) {
      throw new NotFoundException(i18n.t('error.NOT_FOUND'));
    }
    return true;
  }

  async convert(dto: ConvertUomDto) {
    return await this.unitOfMeasureHelperService.getConversionFactor(
      dto.sourceUom,
      dto.targetUom,
    );
  }

  async loadSystemUoms() {
    const unitsToLoad = ['length', 'mass', 'volume', 'pieces'];
    const convert = configureMeasurements<
      AllMeasures,
      AllMeasuresSystems,
      AllMeasuresUnits
    >(allMeasures);
    const units = convert().list();
    for (const i in units) {
      console.log(units[i].measure);
      if (unitsToLoad.includes(units[i].measure)) {
        await this.unitOfMeasureModel.findOneAndUpdate(
          {
            abbr: units[i].abbr,
            system: units[i].system,
          },
          {
            name: units[i].singular,
            nameAr: units[i].singular,
            measure: units[i].measure,
            abbr: units[i].abbr,
            system: units[i].system,
          },
          { upsert: true, setDefaultsOnInsert: true },
        );
      }
    }
  }
}
