import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  ProductionEvent,
  ProductionEventDocument,
} from './schema/production-event.schema';
import { Model } from 'mongoose';
import { InventoryHelperService } from '../inventory/inventory-helper.service';
import { Recipe, RecipeDocument } from 'src/recipe/schema/recipe.schema';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';
import { CreateProductionEventDto } from './dto/create-production-event.dto';

@Injectable()
export class ProductionEventHelperService {
  constructor(
    @InjectModel(ProductionEvent.name)
    private readonly productionEventModel: Model<ProductionEventDocument>,
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<RecipeDocument>,
    private readonly inventoryHelperService: InventoryHelperService,
  ) {}

  async executeRecipe(dto: CreateProductionEventDto) {
    const recipe = await this.recipeModel
      .findOne({
        masterMaterialId: dto.materialId,
      })
      .populate([
        {
          path: 'masterMaterialId',
        },
      ]);

    if (recipe) {
      const preparedData =
        await this.inventoryHelperService.handleSemiFinishedMaterialPostSale(
          recipe.masterMaterialId,
          recipe,
          {
            restaurantId: dto.restaurantId,
            quantitiesSold: dto.quantity,
            uom: dto.uom,
          },
          true,
        );
      return preparedData;
    }
    throw new BadRequestException(`No Recipe found`);
  }
}
