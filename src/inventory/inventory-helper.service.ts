import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, PaginateModel, PaginateResult } from 'mongoose';
import { MaterialItemDocument } from 'src/purchase-order/schemas/material-item.schema';
import { InventoryService } from './inventory.service';

import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { InventoryAction, InventoryDirection } from './enum/en';
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
import { Recipe, RecipeDocument } from 'src/recipe/schema/recipe.schema';
import { MaterialType, ProcurementType } from 'src/material/enum/en';
import { RecipeService } from 'src/recipe/recipe.service';
import { WasteEventDocument } from 'src/waste-event/schema/waste-event.schema';

import {
  InventoryCount,
  InventoryCountDocument,
} from 'src/inventory-count/schema/inventory-count.schema';
import {
  ProfitDetail,
  ProfitDetailDocument,
} from 'src/profit-detail/schema/profit-detail.schema';
import { InventoryTransferDocument } from './schemas/inventory-transfer.schema';

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
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<RecipeDocument>,
    @InjectModel(ProfitDetail.name)
    private readonly profitDetailModel: Model<ProfitDetailDocument>,
    @Inject(forwardRef(() => UnitOfMeasureHelperService))
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
    private readonly recipeService: RecipeService,
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
        goodsReceipt,
      );
      goodsReceipt.items[i].baseUom = inventoryItem.materialId.uomBase;
      goodsReceipt.items[i].baseUomStock =
        goodsReceipt.items[i].stock * calculatedInventory.conversionFactor;
      goodsReceipt.items[i].baseUomCost =
        goodsReceipt.items[i].cost / calculatedInventory.conversionFactor;

      inventoryItem.expirationDate = goodsReceipt.items[i].expirationDate;
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
    const calculatedInventory: CalculatedInventory = {
      stock: inventoryItem.stock,
      averageCost: inventoryItem.averageCost,
      stockValue: inventoryItem.stockValue,
      conversionFactor: 1,
      direction: InventoryDirection.Negataive,
    };
    let convert = { conversionFactor: 1 };
    if (item.uom.toString() != inventoryItem.materialId.uomBase.toString()) {
      convert = await this.unitOfMeasureHelperService.getConversionFactor(
        item.uom,
        inventoryItem.materialId.uomBase,
      );
    }

    if (action == InventoryAction.ReceivedWithTransfer) {
      item.cost = item.cost * convert.conversionFactor;
    }
    switch (action) {
      case InventoryAction.ReceivedWithTransfer:
      case InventoryAction.ProductionEvent:
      case InventoryAction.GoodsReceipt:
        calculatedInventory.stock =
          inventoryItem.stock + item.stock * convert.conversionFactor;
        console.log(calculatedInventory);
        calculatedInventory.averageCost =
          (inventoryItem.stock * inventoryItem.averageCost +
            item.cost * item.stock) /
          calculatedInventory.stock;
        calculatedInventory.direction = InventoryDirection.Positive;
        break;

      case InventoryAction.SentWithTransfer:
        calculatedInventory.stock =
          inventoryItem.stock - item.stock * convert.conversionFactor;
        console.log(calculatedInventory);

        break;

      case InventoryAction.ItemSold:
      case InventoryAction.WasteEvent:
        calculatedInventory.stock =
          inventoryItem.stock - item.stock * convert.conversionFactor;
        break;
      case InventoryAction.InventoryCount:
      case InventoryAction.ManualCount:
        if (item.stock)
          calculatedInventory.stock = item.stock * convert.conversionFactor;
        if (item.cost)
          calculatedInventory.averageCost =
            item.cost / convert.conversionFactor;
        if (calculatedInventory.stock > inventoryItem.stock)
          calculatedInventory.direction = InventoryDirection.Positive;
        break;
    }

    calculatedInventory.stockValue = roundOffNumber(
      calculatedInventory.stock * calculatedInventory.averageCost,
    );
    const stock = item.stock ? item.stock * convert.conversionFactor : null;
    const cost = item.cost
      ? item.cost / convert.conversionFactor
      : inventoryItem.averageCost;
    const stockValue = stock && cost ? stock * cost : null;

    calculatedInventory.sourceItemWithBase = {
      stock,
      cost,
      stockValue,
    };
    calculatedInventory.conversionFactor = convert.conversionFactor;
    return calculatedInventory;
  }

  async applyTransferRequest(
    req,
    sourceInventoryItem: InventoryDocument,
    inventoryTransfer: InventoryTransferDocument,
  ) {
    for (const i in inventoryTransfer.target) {
      let targetInventoryItem: InventoryDocument = await this.inventoryModel
        .findOne({
          restaurantId: inventoryTransfer.target[i].targetRestaurantId,
          materialId: inventoryTransfer.materialId,
        })
        .populate([{ path: 'materialId' }]);

      if (!targetInventoryItem) {
        targetInventoryItem = await this.inventoryService.create(req, {
          restaurantId:
            inventoryTransfer.target[i].targetRestaurantId.toString(),
          materialId: inventoryTransfer.materialId.toString(),
          stock: 0,
          averageCost: 0,
          storageArea: null,
          uom: inventoryTransfer.uom.toString(),
        });
      }
      const calculatedInventory = await this.calculateInventoryItem(
        targetInventoryItem,
        {
          stock: inventoryTransfer.target[i].stock,
          uom: inventoryTransfer.uom.toString(),
          cost: sourceInventoryItem.averageCost,
        },
        InventoryAction.ReceivedWithTransfer,
      );

      console.log('########', calculatedInventory);

      targetInventoryItem = await this.saveInventory(
        targetInventoryItem,
        calculatedInventory,
        InventoryAction.ReceivedWithTransfer,
        inventoryTransfer,
      );

      this.applyToMenuItem(targetInventoryItem);
    }

    const sourceCalculatedInventory = await this.calculateInventoryItem(
      sourceInventoryItem,
      {
        stock: inventoryTransfer.stock,
        uom: inventoryTransfer.uom.toString(),
        cost: sourceInventoryItem.averageCost,
      },
      InventoryAction.SentWithTransfer,
    );

    sourceInventoryItem = await this.saveInventory(
      sourceInventoryItem,
      sourceCalculatedInventory,
      InventoryAction.SentWithTransfer,
      inventoryTransfer,
    );

    this.applyToMenuItem(sourceInventoryItem);
  }

  async applyWasteEvent(wasteEvent: WasteEventDocument) {
    await wasteEvent.populate([{ path: 'materialId' }]);
    let inventory: InventoryDocument = await this.inventoryModel.findOne({
      restaurantId: wasteEvent.restaurantId,
      materialId: wasteEvent.materialId._id,
    });

    if (inventory) {
      inventory.materialId = wasteEvent.materialId;
      const calculatedInventory = await this.calculateInventoryItem(
        inventory,
        {
          stock: wasteEvent.quantity,
          uom: wasteEvent.uom.toString(),
        },
        InventoryAction.WasteEvent,
      );
      await this.saveInventory(
        inventory,
        calculatedInventory,
        InventoryAction.WasteEvent,
        wasteEvent,
      );
    }
  }

  async applyInventoryCount(inventoryCount: InventoryCountDocument) {
    for (const j in inventoryCount.items) {
      let count = 0;
      for (const i in inventoryCount.items[j].count) {
        let conversionFactor = 1;
        if (
          inventoryCount.items[j].count[i].uom.toString() !=
          inventoryCount.items[j].uomBase.toString()
        ) {
          const convert =
            await this.unitOfMeasureHelperService.getConversionFactor(
              inventoryCount.items[j].count[i].uom,
              inventoryCount.items[j].uomBase,
            );
          conversionFactor = convert.conversionFactor;
        }
        count += inventoryCount.items[j].count[i].quantity * conversionFactor;
      }
      let inventory: InventoryDocument = await this.inventoryModel
        .findOne({
          materialId: inventoryCount.items[j].materialId,
          restaurantId: inventoryCount.restaurantId,
        })
        .populate([{ path: 'materialId' }]);

      const calculatedInventory = await this.calculateInventoryItem(
        inventory,
        {
          stock: count,
          uom: inventory.materialId.uomBase.toString(),
        },
        InventoryAction.InventoryCount,
      );

      inventory.storage = inventoryCount.items[j].count;
      inventory.expirationDate = inventoryCount.items[j].expirationDate;
      inventory = await this.saveInventory(
        inventory,
        calculatedInventory,
        InventoryAction.InventoryCount,
        inventoryCount,
      );
      this.applyToMenuItem(inventory);
    }
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
        let conversionFactor = 1;
        if (
          inventoryItem.materialId.uomBase &&
          inventoryItem.materialId.uomSell &&
          inventoryItem.materialId.uomBase.toString() !=
            inventoryItem.materialId.uomSell.toString()
        ) {
          const convert =
            await this.unitOfMeasureHelperService.getConversionFactor(
              inventoryItem.materialId.uomBase,
              inventoryItem.materialId.uomSell,
            );
          conversionFactor = convert.conversionFactor;
        }

        const stockInSellType = inventoryItem.stock * conversionFactor;
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
    price: number;
    entity: Document;
    paymentStatus?: string;
  }) {
    const material = await this.materialModel.findOne({
      menuItemId: options.menuItemId,
    });
    if (material) {
      const recipe = await this.recipeModel.findOne({
        masterMaterialId: material._id,
      });
      let totalCost = 0;
      if (recipe) {
        const preparedData = await this.handleSemiFinishedMaterialPostSale(
          material,
          recipe,
          options,
        );
        if (preparedData) totalCost = preparedData.totalCost;
      } else {
        const inventory = await this.handleFinishedMaterialPostSale(
          material,
          options,
        );
        if (inventory) {
          totalCost = inventory.averageCost * options.quantitiesSold;
        }
      }
      if (totalCost) {
        await this.profitDetailModel.create({
          supplierId: material.supplierId,
          restaurantId: options.restaurantId,
          materialId: material._id,
          orderId: options.entity._id,
          menuItemId: options.menuItemId,
          quantity: options.quantitiesSold,
          unitPrice: options.price,
          totalPrice: options.price * options.quantitiesSold,
          unitCost: totalCost / options.quantitiesSold,
          totalCost: totalCost,
          profit: options.price * options.quantitiesSold - totalCost,
          paymentStatus: options.paymentStatus,
        });
      }
    }
  }

  async handleFinishedMaterialPostSale(
    material: MaterialDocument,
    options: {
      restaurantId: string;
      entity: Document;
      quantitiesSold: number;
    },
  ) {
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
          uom: inventory.materialId.uomSell
            ? inventory.materialId.uomSell.toString()
            : material.uomBase.toString(),
        },
        InventoryAction.ItemSold,
      );
      await this.saveInventory(
        inventory,
        calculatedInventory,
        InventoryAction.ItemSold,
        options.entity,
      );
      return inventory;
    }
  }

  async handleSemiFinishedMaterialPostSale(
    material: MaterialDocument,
    recipe: RecipeDocument,
    options: {
      restaurantId: string;
      entity: Document;
      quantitiesSold: number;
      uom?: string;
    },
    isProductionEvent = false,
  ) {
    console.log('Recipe', JSON.parse(JSON.stringify(recipe)));
    const preparedData = {
      items: [],
      totalCost: 0,
    };
    if (!options.uom) {
      options.uom = recipe.uom.toString();
    }
    const inventoriesToSave = [];
    for (const i in recipe.components) {
      let inventoryItem: InventoryDocument = await this.inventoryModel
        .findOne({
          restaurantId: options.restaurantId,
          materialId: recipe.components[i].materialId,
        })
        .populate([{ path: 'materialId' }]);
      if (!inventoryItem) {
        inventoryItem = await this.inventoryService.create(
          {
            user: {
              userId: null,
              supplierId: recipe.supplierId,
            },
          },
          {
            restaurantId: options.restaurantId,
            materialId: recipe.components[i].materialId.toString(),
            stock: 0,
            averageCost: 0,
            storageArea: null,
            uom: recipe.components[i].uom.toString(),
          },
        );
        await inventoryItem.populate([{ path: 'materialId' }]);
      }

      console.log('Material at Inventory Level', inventoryItem.materialId);
      let stock =
        (recipe.components[i].stock * options.quantitiesSold) / recipe.quantity;
      if (options.uom != recipe.uom.toString()) {
        const convert =
          await this.unitOfMeasureHelperService.getConversionFactor(
            options.uom,
            recipe.uom,
          );

        stock *= convert.conversionFactor;
      }
      const calculatedInventory = await this.calculateInventoryItem(
        inventoryItem,
        {
          stock,
          uom: recipe.components[i].uom.toString(),
        },
        InventoryAction.ItemSold,
      );

      console.log('########', calculatedInventory);
      inventoriesToSave.push({
        inventoryItem,
        calculatedInventory,
      });

      preparedData.items.push({
        ...recipe.components[i],
        appliedStock: recipe.components[i].stock * options.quantitiesSold,
        baseUomStock: calculatedInventory.sourceItemWithBase.stock,
        stockValue: calculatedInventory.sourceItemWithBase.stockValue,
        baseUomCost: calculatedInventory.sourceItemWithBase.cost,
        baseUom: inventoryItem.materialId.uomBase,
      });
      preparedData.totalCost +=
        calculatedInventory.sourceItemWithBase.stockValue;
    }
    for (const i in inventoriesToSave) {
      const inventory = await this.saveInventory(
        inventoriesToSave[i].inventoryItem,
        inventoriesToSave[i].calculatedInventory,
        isProductionEvent
          ? InventoryAction.ProductionEvent
          : InventoryAction.ComponentsItemSold,
        options.entity,
      );

      this.applyToMenuItem(inventory);
    }
    if (isProductionEvent) {
      await this.handleSemiFinishedMaterialPostProductionEvent(material, {
        restaurantId: options.restaurantId,
        uom: options.uom,
        stock: options.quantitiesSold,
        totalCost: preparedData.totalCost,
        entity: options.entity,
      });
    }
    return preparedData;
  }

  async handleSemiFinishedMaterialPostProductionEvent(
    material: MaterialDocument,
    options: {
      stock: number;
      uom: string;
      restaurantId: string;
      totalCost: number;
      entity: Document;
    },
  ) {
    let inventoryItem: InventoryDocument = await this.inventoryModel.findOne({
      restaurantId: options.restaurantId,
      materialId: material._id,
    });
    if (!inventoryItem) {
      inventoryItem = await this.inventoryService.create(
        {
          user: {
            userId: null,
            supplierId: material.supplierId,
          },
        },
        {
          restaurantId: options.restaurantId,
          materialId: material._id.toString(),
          stock: 0,
          averageCost: 0,
          storageArea: null,
          uom: options.uom.toString(),
        },
      );
    }
    inventoryItem.materialId = material;

    const calculatedInventory = await this.calculateInventoryItem(
      inventoryItem,
      {
        stock: options.stock,
        cost: options.totalCost / options.stock,
        uom: options.uom.toString(),
      },
      InventoryAction.ProductionEvent,
    );

    console.log('########', calculatedInventory);

    inventoryItem = await this.saveInventory(
      inventoryItem,
      calculatedInventory,
      InventoryAction.ProductionEvent,
      options.entity,
    );

    this.applyToMenuItem(inventoryItem);
  }

  async saveInventory(
    inventory: InventoryDocument,
    calculatedInventory: CalculatedInventory,
    action: InventoryAction,
    entity: Document,
  ): Promise<InventoryDocument> {
    console.log('For Saving', calculatedInventory);
    inventory.set({
      stock: calculatedInventory.stock > 0 ? calculatedInventory.stock : 0,
      averageCost: calculatedInventory.averageCost,
      stockValue:
        calculatedInventory.stockValue > 0 ? calculatedInventory.stockValue : 0,
    });
    if (action == InventoryAction.InventoryCount) {
      inventory.virtualConsumption = 0;
    } else if (
      calculatedInventory.stock < 0 &&
      calculatedInventory.sourceItemWithBase.stock
    ) {
      inventory.virtualConsumption = inventory.virtualConsumption
        ? inventory.virtualConsumption - calculatedInventory.stock
        : calculatedInventory.stock;
    }
    await inventory.save();
    this.saveHistory(inventory, calculatedInventory, action, entity);
    return inventory;
  }

  async saveHistory(
    inventory: InventoryDocument,
    calculatedInventory: CalculatedInventory,
    action: InventoryAction,
    entity: Document,
  ) {
    await this.inventoryHistoryModel.create({
      supplierId: inventory.supplierId,
      restaurantId: inventory.restaurantId,
      materialId: inventory.materialId,
      uomBase: inventory.uomBase,
      uomInventory: inventory.uomInventory,
      ...calculatedInventory.sourceItemWithBase,
      conversionFactor: calculatedInventory.conversionFactor,
      action,
      dataId: entity ? entity._id : null,
      direction: calculatedInventory.direction,
    });
  }
}
