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
import { RawMaterial, RawMaterialDocument } from './schema/raw-material.schema';
import { RecipeSimulationMaterial } from './schema/recipe-simulation-material.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';
import { CreateRawMaterialComponentDto } from './dto/create-raw-material-component.dto';
import { MaterialDocument } from 'src/material/schemas/material.schema';
import { ProfitDetail } from '../profit-detail/schema/profit-detail.schema';
import { CreateProductReportDto } from './dto/create-product-report.dto';

@Injectable()
export class CostSimulatorHelperService {
  constructor(
    @InjectModel(CostSimulator.name)
    private readonly costSimulatorModel: Model<CostSimulatorDocument>,
    @InjectModel(RawMaterial.name)
    private readonly rawMaterialModel: Model<RawMaterialDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async calculateProductCost(
    components: RecipeSimulationMaterial[] | CreateRawMaterialComponentDto[],
  ) {
    const normalisedComponents: any = components;
    const rawMaterials = await this.rawMaterialModel.find({
      materialId: {
        $in: normalisedComponents.map((c) => {
          return c.materialId;
        }),
      },
    });

    let totalCost = 0,
      simulatedCost = 0;
    const items = [];

    for (const i in rawMaterials) {
      const component = normalisedComponents.find((c) => {
        return c.materialId.toString() == rawMaterials[i]._id.toString();
      });
      if (component) {
        let conversionFactor = 1;
        if (component.uom.toString() != rawMaterials[i].uom.toString()) {
          const convert =
            await this.unitOfMeasureHelperService.getConversionFactor(
              component.uom,
              rawMaterials[i].uom,
            );
          conversionFactor = convert.conversionFactor;
        }

        totalCost +=
          component.quantity * conversionFactor * rawMaterials[i].unitPrice;
        simulatedCost +=
          component.quantity *
          conversionFactor *
          rawMaterials[i].simulatedPrice;
      }
    }
    return { calculatedCost: totalCost, simulatedCost };
  }
  async calculateProfitDetails(
    cost: {
      calculatedCost: number;
      simulatedCost: number;
    },
    sellPrice: number,
    quantity: number,
  ) {
    const profitDetails = {
      unitProfit: sellPrice / quantity - cost.calculatedCost,
      simulatedUnitProfit: sellPrice / quantity - cost.simulatedCost,
      profitMargin: 0,
      simulatedProfitMargin: 0,
      unitSimulatedProfitChange: 0,
    };
    profitDetails.profitMargin =
      (100 * profitDetails.unitProfit) / cost.calculatedCost;
    profitDetails.simulatedProfitMargin =
      (100 * profitDetails.simulatedUnitProfit) / cost.simulatedCost;

    profitDetails.unitSimulatedProfitChange =
      profitDetails.simulatedUnitProfit - profitDetails.unitProfit;
    return profitDetails;
  }

  async applyMaterialChangeToMaterial(rawMaterial: RawMaterialDocument) {
    const materials = await this.rawMaterialModel.find({
      'components.materialId': rawMaterial._id,
    });
    for (const i in materials) {
      const cost = await this.calculateProductCost(materials[i].components);
      materials[i].set({
        unitPrice: cost.calculatedCost / materials[i].quantity,
        simulatedPrice: cost.simulatedCost / materials[i].quantity,
      });
      await materials[i].save();
      await this.applyMaterialChangeToProduct(materials[i]);
    }
    await this.applyMaterialChangeToProduct(rawMaterial);
  }

  async applyMaterialChangeToProduct(rawMaterial: RawMaterialDocument) {
    const products = await this.costSimulatorModel.find({
      'components.materialId': rawMaterial._id,
    });
    for (const i in products) {
      let cost = await this.calculateProductCost(products[i].components);
      cost = {
        calculatedCost: cost.calculatedCost / products[i].perQuantity,
        simulatedCost: cost.simulatedCost / products[i].perQuantity,
      };
      const profitDetails = await this.calculateProfitDetails(
        cost,
        products[i].sellPrice,
        products[i].perQuantity,
      );
      products[i].set({ ...cost, ...profitDetails });
      products[i].save();
    }
  }

  async calculateForReport(
    dto: CreateProductReportDto,
    product: CostSimulatorDocument,
  ) {
    const calculatedCost = dto.quantitiesSold * product.calculatedCost;
    const simulatedCost = dto.quantitiesSold * product.simulatedCost;
    const profit = dto.salesVolume - calculatedCost;
    const simulatedProfit = dto.salesVolume - simulatedCost;
    const response = {
      calculatedCost,
      profit,
      simulatedCost,
      simulatedProfit,
      profitMargin: (100 * profit) / calculatedCost,
      simulatedProfitMargin: (100 * simulatedProfit) / simulatedCost,
      simulatedProfitChange: simulatedProfit - profit,
    };
    return response;
  }
}
