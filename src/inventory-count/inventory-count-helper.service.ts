import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { UpdateInventoryCountDto } from './dto/update-inventory-count.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  InventoryCount,
  InventoryCountDocument,
} from './schema/inventory-count.schema';
import { Model, PaginateModel } from 'mongoose';

import { InventoryDocument } from 'src/inventory/schemas/inventory.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';

@Injectable()
export class InventoryCountHelperService {
  constructor(
    @InjectModel(InventoryCount.name)
    private readonly inventoryCountModel: Model<InventoryCountDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async prepareInventoryCountData(
    dto: CreateInventoryCountDto | UpdateInventoryCountDto,
    inventory: InventoryDocument,
  ) {
    let count = 0;
    for (const i in dto.count) {
      let conversionFactor = 1;
      if (
        dto.count[i].uom.toString() != inventory.materialId.uomBase.toString()
      ) {
        const convert =
          await this.unitOfMeasureHelperService.getConversionFactor(
            dto.count[i].uom,
            inventory.materialId.uomBase,
          );
        conversionFactor = convert.conversionFactor;
        count += dto.count[i].quantity * conversionFactor;
      }
    }
    let differentialCount = count - inventory.stock;
    differentialCount =
      differentialCount > 0 ? differentialCount : differentialCount * -1;
    return {
      countValue: count * inventory.averageCost,
      onHandCount: inventory.stock,
      onHandCountValue: inventory.stockValue,
      differentialCount,
      differentialCountValue: inventory.averageCost * differentialCount,
    };
  }
}
