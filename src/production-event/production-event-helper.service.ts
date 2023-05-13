import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  ProductionEvent,
  ProductionEventDocument,
} from './schema/production-event.schema';
import { Model } from 'mongoose';
import { InventoryHelperService } from '../inventory/inventory-helper.service';
import { Recipe, RecipeDocument } from 'src/recipe/schema/recipe.schema';

@Injectable()
export class ProductionEventHelperService {
  constructor(
    @InjectModel(ProductionEvent.name)
    private readonly productionEventModel: Model<ProductionEventDocument>,
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<RecipeDocument>,
    private readonly inventoryHelperService: InventoryHelperService,
  ) {}

  async postProductionEventCreate(productionEvent: ProductionEventDocument) {
    await productionEvent.populate([
      {
        path: 'materialId',
      },
    ]);
    const recipe = await this.recipeModel
      .findOne({
        masterMaterialId: productionEvent.materialId._id,
      })
      .populate([{ path: 'components.materialId' }]);
    if (recipe)
      await this.inventoryHelperService.handleSemiFinishedMaterialPostSale(
        productionEvent.materialId,
        recipe,
        {
          restaurantId: productionEvent.restaurantId.toString(),
          quantitiesSold: productionEvent.quantity,
          uom: productionEvent.uom.toString(),
        },
        true,
      );
  }
}
