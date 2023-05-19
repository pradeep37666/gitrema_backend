import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { UpdateInventoryCountDto } from './dto/update-inventory-count.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  InventoryCount,
  InventoryCountDocument,
} from './schema/inventory-count.schema';
import { Model, PaginateModel } from 'mongoose';

import {
  Inventory,
  InventoryDocument,
} from 'src/inventory/schemas/inventory.schema';
import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';

@Injectable()
export class InventoryCountHelperService {
  constructor(
    @InjectModel(InventoryCount.name)
    private readonly inventoryCountModel: Model<InventoryCountDocument>,
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async prepareInventoryCountData(
    dto: CreateInventoryCountDto | UpdateInventoryCountDto,

    i18n,
  ) {
    let inventories = await this.inventoryModel
      .find({
        restaurantId: dto.restaurantId,
        materialId: {
          $in: dto.items.map((i) => {
            return i.materialId;
          }),
        },
      })
      .populate([{ path: 'materialId' }]);
    inventories = inventories.reduce((acc, d) => {
      acc[d.materialId._id.toString()] = d;
      return acc;
    }, []);
    console.log(inventories);
    for (const j in dto.items) {
      if (!inventories[dto.items[j].materialId]) {
        throw new NotFoundException(i18n.t('error.NOT_FOUND'));
      }
      const inventory = inventories[dto.items[j].materialId];
      let count = 0;
      for (const i in dto.items[j].count) {
        let conversionFactor = 1;
        if (
          dto.items[j].count[i].uom.toString() !=
          inventory.materialId.uomBase.toString()
        ) {
          const convert =
            await this.unitOfMeasureHelperService.getConversionFactor(
              dto.items[j].count[i].uom,
              inventory.materialId.uomBase,
            );
          conversionFactor = convert.conversionFactor;
        }
        count += dto.items[j].count[i].quantity * conversionFactor;
      }
      console.log(count);
      let differentialCount = count - inventory.stock;
      differentialCount =
        differentialCount > 0 ? differentialCount : differentialCount * -1;
      dto.items[j] = {
        ...dto.items[j],
        uomBase: inventory.uomBase,
        countValue: count * inventory.averageCost,
        onHandCount: inventory.stock,
        onHandCountValue: inventory.stockValue,
        differentialCount,
        differentialCountValue: inventory.averageCost * differentialCount,
      };
    }

    return dto;
  }
}
