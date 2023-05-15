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
      .populate([
        {
          path: 'baseUnit',
          populate: {
            path: 'baseUnit',
            model: 'UnitOfMeasure',
          },
        },
      ]);
    console.log(unitOfMeasures);
    const sourceUom = unitOfMeasures.find((uom) => {
      return uom._id.toString() == sourceUomId?.toString();
    });
    console.log(sourceUom);
    const targetUom = unitOfMeasures.find((uom) => {
      return uom._id.toString() == targetUomId?.toString();
    });
    console.log(targetUom);

    if (!sourceUom || !targetUom) {
      return {
        conversionFactor: 1,
        sourceUom,
        targetUom,
      };
    }
    let refSourceUom: UnitOfMeasureDocument = sourceUom;
    let sourceUomAbbr = null;
    let sourceBaseValue = 1;
    while (refSourceUom) {
      sourceUomAbbr = refSourceUom.abbr ?? null;
      if (refSourceUom.baseUnit) {
        sourceBaseValue *= refSourceUom.baseConversionRate ?? 1;
        refSourceUom = refSourceUom.baseUnit;
      } else {
        refSourceUom = null;
      }
    }
    let refTargetUom: UnitOfMeasureDocument = targetUom;
    let targetUomAbbr = null;
    let targetBaseValue = 1;
    while (refTargetUom) {
      targetUomAbbr = refTargetUom.abbr ?? null;
      if (refTargetUom.baseUnit) {
        targetBaseValue *= refTargetUom.baseConversionRate ?? 1;
        refTargetUom = refTargetUom.baseUnit;
      } else {
        refTargetUom = null;
      }
    }

    const conversionFactor: number =
      convert(sourceBaseValue).from(sourceUomAbbr).to(targetUomAbbr) /
      targetBaseValue;
    console.log('########', sourceUomAbbr, targetUomAbbr, conversionFactor);
    return { conversionFactor, targetUom, sourceUom };
  }
}
