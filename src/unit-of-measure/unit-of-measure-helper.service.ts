import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  UnitOfMeasure,
  UnitOfMeasureDocument,
} from './schemas/unit-of-measure.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import configureMeasurements, {
  AllMeasures,
  AllMeasuresSystems,
  AllMeasuresUnits,
  allMeasures,
} from 'convert-units';

@Injectable()
export class UnitOfMeasureHelperService {
  constructor(
    @InjectModel(UnitOfMeasure.name)
    private readonly unitOfMeasureModel: Model<UnitOfMeasureDocument>,
  ) {}

  async getConversionFactor(
    sourceUomId,
    targetUomId,
  ): Promise<{
    conversionFactor: number;
    sourceUom: UnitOfMeasureDocument;
    targetUom: UnitOfMeasureDocument;
  }> {
    const convert = configureMeasurements<
      AllMeasures,
      AllMeasuresSystems,
      AllMeasuresUnits
    >(allMeasures);
    console.log('12', sourceUomId);
    console.log('34', targetUomId);
    const unitOfMeasures = await this.unitOfMeasureModel
      .find(
        { _id: { $in: [sourceUomId, targetUomId] } },
        {
          __v: 0,
          addedBy: 0,
          deletedAt: 0,
          createdAt: 0,
          updatedAt: 0,
          supplierId: 0,
        },
      )
      .populate([{ path: 'baseUnit' }]);
    console.log(unitOfMeasures);
    const sourceUom = unitOfMeasures.find((uom) => {
      return uom._id.toString() == sourceUomId;
    });
    console.log(sourceUom);
    const targetUom = unitOfMeasures.find((uom) => {
      return uom._id.toString() == targetUomId;
    });
    console.log(targetUom);

    const sourceUomAbbr = sourceUom.baseUnit
      ? sourceUom.baseUnit.abbr
      : sourceUom.abbr;
    const targetUomAbbr = targetUom.baseUnit
      ? targetUom.baseUnit.abbr
      : targetUom.abbr;
    const sourceBaseValue = sourceUom.baseUnit
      ? sourceUom.baseUnit.baseConversionRate
      : 1;
    const targetBaseValue = targetUom.baseUnit
      ? targetUom.baseUnit.baseConversionRate
      : 1;

    const conversionFactor: number =
      convert(sourceBaseValue).from(sourceUomAbbr).to(targetUomAbbr) *
      targetBaseValue;
    console.log('########', sourceUomAbbr, targetUomAbbr, conversionFactor);
    return { conversionFactor, targetUom, sourceUom };
  }
}
