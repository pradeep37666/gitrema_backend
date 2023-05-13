import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  ProductionEvent,
  ProductionEventDocument,
} from './schema/production-event.schema';
import { Model } from 'mongoose';
import { InventoryHelperService } from '../inventory/inventory-helper.service';

@Injectable()
export class ProductionEventHelperService {
  constructor(
    @InjectModel(ProductionEvent.name)
    private readonly productionEventModel: Model<ProductionEventDocument>,
    private readonly inventoryHelperService: InventoryHelperService,
  ) {}

  async postProductionEventCreate(productionEvent: ProductionEventDocument) {
    await productionEvent.populate([
      {
        path: 'materialId',
      },
    ]);
    await this.inventoryHelperService.handleSemiFinishedMaterialPostSale(
      productionEvent.materialId,
      {
        restaurantId: productionEvent.restaurantId.toString(),
        quantitiesSold: productionEvent.quantity,
        uom: productionEvent.uom.toString(),
      },
      true,
    );
  }
}
