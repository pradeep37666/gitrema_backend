import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { MaterialItemDocument } from 'src/purchase-order/schemas/material-item.schema';
import { InventoryService } from './inventory.service';
import { GoodsReceiptMaterialItemDto } from 'src/goods-receipt/dto/create-goods-receipt.dto';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { InventoryAction } from './enum/en';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';
import { CalculatedInventory } from './interface/calculated-inventory.interface';
import { UnitOfMeasureHelperService } from '../unit-of-measure/unit-of-measure-helper.service';

@Injectable()
export class InventoryHelperService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @Inject(forwardRef(() => UnitOfMeasureHelperService))
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async processInventoryChanges(
    req,
    restaurantId: string,
    items: MaterialItemDocument[],
  ) {
    for (const i in items) {
      let inventoryItem: InventoryDocument = await this.inventoryModel.findOne({
        restaurantId,
        materialId: items[i].materialId,
      });
      if (!inventoryItem) {
        inventoryItem = await this.inventoryService.create(req, {
          restaurantId,
          averageCost: items[i].cost,
          ...items[i].toObject(),
          isFirstGoodsReceipt: true,
        });
      } else {
        await inventoryItem.populate([{ path: 'materialId' }]);
        const calculatedInventory = await this.calculateInventoryItem(
          inventoryItem,
          items[i].toObject(),
          InventoryAction.GoodsReceipt,
        );
        inventoryItem = await this.saveInventory(
          inventoryItem,
          calculatedInventory,
          InventoryAction.GoodsReceipt,
        );
        this.applyToMenuItem(inventoryItem);
      }
    }
  }

  async calculateInventoryItem(
    inventoryItem: InventoryDocument,
    item: {
      stock: number;
      cost?: number;
      uom?: string;
    },
    action: InventoryAction,
  ): Promise<CalculatedInventory> {
    console.log('Testing', inventoryItem, item, action);
    const calculatedInventory = {
      stock: inventoryItem.stock,
      averageCost: inventoryItem.averageCost,
      stockValue: inventoryItem.stockValue,
    };
    const convert = await this.unitOfMeasureHelperService.getConversionFactor(
      item.uom,
      inventoryItem.materialId.uomBase,
    );
    switch (action) {
      case InventoryAction.GoodsReceipt:
        calculatedInventory.stock =
          inventoryItem.stock + item.stock * convert.conversionFactor;
        console.log(calculatedInventory);
        calculatedInventory.averageCost =
          (inventoryItem.stock * inventoryItem.averageCost +
            item.cost * item.stock) /
          calculatedInventory.stock;
        break;
      case InventoryAction.ItemSold:
        calculatedInventory.stock =
          inventoryItem.stock - item.stock * convert.conversionFactor;
        break;
      case InventoryAction.ManualCount:
        if (item.stock)
          calculatedInventory.stock = item.stock * convert.conversionFactor;
        if (item.cost)
          calculatedInventory.averageCost =
            item.cost * convert.conversionFactor;
        break;
    }
    calculatedInventory.stockValue = roundOffNumber(
      calculatedInventory.stock * calculatedInventory.averageCost,
    );
    return calculatedInventory;
  }

  async applyToMenuItem(inventoryItem: InventoryDocument) {
    if (inventoryItem.materialId.isQuantityManaged) {
      const menuItem = await this.menuItemModel.findById(
        inventoryItem.materialId.menuItemId,
      );

      if (menuItem) {
        const index = menuItem.quantities.findIndex((r) => {
          return (
            r.restaurantId.toString() == inventoryItem.restaurantId.toString()
          );
        });
        const convert =
          await this.unitOfMeasureHelperService.getConversionFactor(
            inventoryItem.materialId.uomBase,
            inventoryItem.materialId.uomSell,
          );
        const stockInSellType = inventoryItem.stock * convert.conversionFactor;
        if (index > -1) {
          menuItem.quantities[index].quantity = stockInSellType;
        } else {
          menuItem.quantities.push({
            restaurantId: inventoryItem.restaurantId,
            quantity: stockInSellType,
          });
        }
        console.log('Menu Item', index, menuItem.quantities);
        menuItem.save();
      }
    }
  }

  async handlePostSale(options: {
    restaurantId: string;
    menuItemId: string;
    quantitiesSold: number;
  }) {
    const material = await this.materialModel.findOne({
      menuItemId: options.menuItemId,
    });
    if (material) {
      let inventory: InventoryDocument = await this.inventoryModel.findOne({
        restaurantId: options.restaurantId,
        materialId: material._id,
      });
      inventory.materialId = material;
      if (inventory) {
        const calculatedInventory = await this.calculateInventoryItem(
          inventory,
          {
            stock: options.quantitiesSold,
            uom: inventory?.materialId?.uomSell?.toString(),
          },
          InventoryAction.ItemSold,
        );
        await this.saveInventory(
          inventory,
          calculatedInventory,
          InventoryAction.ItemSold,
        );
      }
    }
  }

  async saveInventory(
    inventory: InventoryDocument,
    calculatedInventory: CalculatedInventory,
    action: InventoryAction,
  ): Promise<InventoryDocument> {
    console.log('For Saving', calculatedInventory);
    inventory.set({
      stock: calculatedInventory.stock,
      averageCost: calculatedInventory.averageCost,
      stockValue: calculatedInventory.stockValue,
    });
    await inventory.save();
    console.log('After Save', inventory);
    return inventory;
  }
}
