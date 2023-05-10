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
import { GoodsReceiptDocument } from 'src/goods-receipt/schemas/goods-receipt.schema';
import {
  InventoryHistory,
  InventoryHistoryDocument,
} from './schemas/inventory-history.schema';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';

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
    @InjectModel(InventoryHistory.name)
    private readonly inventoryHistoryModel: Model<InventoryHistoryDocument>,
    @Inject(forwardRef(() => UnitOfMeasureHelperService))
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
  ) {}

  async processInventoryChanges(req, goodsReceipt: GoodsReceiptDocument) {
    for (const i in goodsReceipt.items) {
      let inventoryItem: InventoryDocument = await this.inventoryModel
        .findOne({
          restaurantId: goodsReceipt.restaurantId,
          materialId: goodsReceipt.items[i].materialId,
        })
        .populate([{ path: 'materialId' }]);
      if (!inventoryItem) {
        inventoryItem = await this.inventoryService.create(req, {
          restaurantId: goodsReceipt.restaurantId,
          averageCost: goodsReceipt.items[i].cost,
          ...goodsReceipt.items[i].toObject(),
          isFirstGoodsReceipt: true,
        });
      }
      const calculatedInventory = await this.calculateInventoryItem(
        inventoryItem,
        goodsReceipt.items[i].toObject(),
        InventoryAction.GoodsReceipt,
      );
      inventoryItem = await this.saveInventory(
        inventoryItem,
        calculatedInventory,
        InventoryAction.GoodsReceipt,
      );
      goodsReceipt.items[i].baseUom = inventoryItem.materialId.uomBase;
      goodsReceipt.items[i].baseUomStock =
        goodsReceipt.items[i].stock * calculatedInventory.conversionFactor;
      goodsReceipt.items[i].baseUomCost =
        goodsReceipt.items[i].cost * calculatedInventory.conversionFactor;

      this.applyToMenuItem(inventoryItem);
      this.applyToMenuItem(inventoryItem);
      this.applyToMenuItem(inventoryItem);
    }
    await goodsReceipt.save();
    return goodsReceipt;
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
      conversionFactor: 1,
    };
    const convert = await this.unitOfMeasureHelperService.getConversionFactor(
      item.uom,
      inventoryItem.materialId.uomBase,
    );
    if (action == InventoryAction.ReceivedWithTransfer) {
      item.cost = item.cost * convert.conversionFactor;
    }
    switch (action) {
      case InventoryAction.ReceivedWithTransfer:
      case InventoryAction.GoodsReceipt:
        calculatedInventory.stock =
          inventoryItem.stock + item.stock * convert.conversionFactor;
        console.log(calculatedInventory);
        calculatedInventory.averageCost =
          (inventoryItem.stock * inventoryItem.averageCost +
            item.cost * item.stock) /
          calculatedInventory.stock;
        break;

      case InventoryAction.SentWithTransfer:
        calculatedInventory.stock =
          inventoryItem.stock - item.stock * convert.conversionFactor;
        console.log(calculatedInventory);

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
    calculatedInventory.conversionFactor = convert.conversionFactor;
    return calculatedInventory;
  }

  async applyTransferRequest(
    req,
    sourceInventoryItem: InventoryDocument,
    transferDetails: TransferInventoryDto,
  ) {
    let targetInventoryItem: InventoryDocument = await this.inventoryModel
      .findOne({
        restaurantId: transferDetails.targetRestaurantId,
        materialId: transferDetails.materialId,
      })
      .populate([{ path: 'materialId' }]);

    if (!targetInventoryItem) {
      targetInventoryItem = await this.inventoryService.create(req, {
        restaurantId: transferDetails.targetRestaurantId,
        materialId: transferDetails.materialId,
        stock: 0,
        averageCost: 0,
        storageArea: null,
        uom: transferDetails.uom,
      });
    }
    const calculatedInventory = await this.calculateInventoryItem(
      targetInventoryItem,
      {
        ...transferDetails,
        cost: sourceInventoryItem.averageCost,
      },
      InventoryAction.ReceivedWithTransfer,
    );

    console.log('########', calculatedInventory);

    targetInventoryItem = await this.saveInventory(
      targetInventoryItem,
      calculatedInventory,
      InventoryAction.ReceivedWithTransfer,
    );

    this.applyToMenuItem(targetInventoryItem);

    const sourceCalculatedInventory = await this.calculateInventoryItem(
      sourceInventoryItem,
      {
        ...transferDetails,
        cost: sourceInventoryItem.averageCost,
      },
      InventoryAction.SentWithTransfer,
    );

    sourceInventoryItem = await this.saveInventory(
      sourceInventoryItem,
      sourceCalculatedInventory,
      InventoryAction.SentWithTransfer,
    );

    this.applyToMenuItem(sourceInventoryItem);

    return { sourceInventoryItem, targetInventoryItem };
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
    this.saveHistory(inventory, calculatedInventory, action);
    return inventory;
  }

  async saveHistory(
    inventory: InventoryDocument,
    calculatedInventory: CalculatedInventory,
    action: InventoryAction,
  ) {
    await this.inventoryHistoryModel.create({
      supplierId: inventory.supplierId,
      restaurantId: inventory.restaurantId,
      materialId: inventory.materialId,
      uomBase: inventory.uomBase,
      uomInventory: inventory.uomInventory,
      ...calculatedInventory,
      action,
    });
  }
}
