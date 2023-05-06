import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGoodsReceiptDto } from './dto/create-goods-receipt.dto';
import { UpdateGoodsReceiptDto } from './dto/update-goods-receipt.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  GoodsReceipt,
  GoodsReceiptDocument,
} from './schemas/goods-receipt.schema';

import { Model, PaginateModel, PaginateResult } from 'mongoose';
import { InventoryHelperService } from 'src/inventory/inventory-helper.service';
import { I18nContext } from 'nestjs-i18n';
import {
  PurchaseOrder,
  PurchaseOrderDocument,
} from 'src/purchase-order/schemas/purchase-order.schema';

@Injectable()
export class GoodsReceiptHelperService {
  constructor(
    @InjectModel(GoodsReceipt.name)
    private readonly goodsReceiptModel: Model<GoodsReceiptDocument>,
    @InjectModel(PurchaseOrder.name)
    private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,
    private readonly inventoryHelperService: InventoryHelperService,
  ) {}

  async postGoodsReceiptCreate(req, goodsReceipt: GoodsReceiptDocument) {
    this.inventoryHelperService.processInventoryChanges(
      req,
      goodsReceipt.restaurantId.toString(),
      goodsReceipt.items,
    );
  }

  async validateGoodsReceipt(dto: CreateGoodsReceiptDto, i18n: I18nContext) {
    const goodsReceipts = await this.goodsReceiptModel.find({
      purchaseOrderId: dto.purchaseOrderId,
    });
    const purchaseOrder = await this.purchaseOrderModel.findById(
      dto.purchaseOrderId,
    );
    const loadedItems = [],
      allowedItems = [];
    goodsReceipts.forEach((goodsReceipt) => {
      goodsReceipt.items.forEach((item) => {
        if (loadedItems[item.materialId.toString()]) {
          loadedItems[item.materialId.toString()] += item.stock;
        } else {
          loadedItems[item.materialId.toString()] = item.stock;
        }
      });
    });
    purchaseOrder.items.forEach((poi) => {
      allowedItems[poi.materialId.toString()] = poi.stock;
    });
    for (const i in dto.items) {
      if (!allowedItems[dto.items[i].materialId]) {
        throw new BadRequestException(
          `${dto.items[i].materialId} ${i18n.t('error.NOT_FOUND')}`,
        );
      }
      const totalAfterLoad = loadedItems[dto.items[i].materialId]
        ? loadedItems[dto.items[i].materialId] + dto.items[i].stock
        : dto.items[i].stock;
      if (allowedItems[dto.items[i].materialId] < totalAfterLoad) {
        throw new BadRequestException(
          `Max ${
            allowedItems[dto.items[i].materialId]
          } quantities allowed for ${dto.items[i].materialId}`,
        );
      }
    }
  }
}
