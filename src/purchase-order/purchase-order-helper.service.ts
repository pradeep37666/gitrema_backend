import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import {
  PurchaseOrder,
  PurchaseOrderDocument,
} from './schemas/purchase-order.schema';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import {
  RestaurantMaterial,
  RestaurantMaterialDocument,
} from 'src/material/schemas/restaurant-material.schema';
import {
  SelectedVendor,
  SelectedVendorDocument,
} from 'src/selected-vendor/schema/selected-vendor.schema';

@Injectable()
export class PurchaseOrderHelperService {
  constructor(
    @InjectModel(PurchaseOrder.name)
    private readonly purchaseOrderModel: Model<PurchaseOrderDocument>,

    @InjectModel(RestaurantMaterial.name)
    private readonly restaurantMaterialModel: Model<RestaurantMaterialDocument>,
    @InjectModel(SelectedVendor.name)
    private readonly selectedVendorModel: Model<SelectedVendorDocument>,
  ) {}

  async postPurchaseOrderCreate(purchaseOrder: PurchaseOrderDocument) {
    for (const i in purchaseOrder.items) {
      const restaurantMaterial = await this.restaurantMaterialModel.findOne({
        restaurantId: purchaseOrder.restaurantId,
        merchantId: purchaseOrder.items[i].materialId,
        supplierId: purchaseOrder.supplierId,
      });
      if (!restaurantMaterial) {
        await this.restaurantMaterialModel.create({
          restaurantId: purchaseOrder.restaurantId,
          materialId: purchaseOrder.items[i].materialId,
          supplierId: purchaseOrder.supplierId,
        });
      }
      const vendorInfo = await this.selectedVendorModel.findOne({
        restaurantId: purchaseOrder.restaurantId,
        materialId: purchaseOrder.items[i].materialId,
        supplierId: purchaseOrder.supplierId,
        vendorId: purchaseOrder.vendorId,
      });
      if (!vendorInfo) {
        await this.selectedVendorModel.create({
          restaurantId: purchaseOrder.restaurantId,
          materialId: purchaseOrder.items[i].materialId,
          vendorMaterialId: purchaseOrder.items[i].vendorMaterialId ?? null,
          supplierId: purchaseOrder.supplierId,
          vendorId: purchaseOrder.vendorId,
          quantity: 1,
          cost: purchaseOrder.items[i].cost,
          uom: purchaseOrder.items[i].uom,
          isDefault: true,
        });
      }
    }
  }
  async postPurchaseOrderConfirmed(purchaseOrder: PurchaseOrderDocument) {
    for (const i in purchaseOrder.items) {
      await this.selectedVendorModel.findOneAndUpdate(
        {
          restaurantId: purchaseOrder.restaurantId,
          materialId: purchaseOrder.items[i].materialId,
          supplierId: purchaseOrder.supplierId,
          vendorId: purchaseOrder.vendorId,
        },
        {
          restaurantId: purchaseOrder.restaurantId,
          materialId: purchaseOrder.items[i].materialId,
          vendorMaterialId: purchaseOrder.items[i].vendorMaterialId ?? null,
          supplierId: purchaseOrder.supplierId,
          vendorId: purchaseOrder.vendorId,

          cost: purchaseOrder.items[i].cost,
          uom: purchaseOrder.items[i].uom,
        },
        { upsert: true, setDefaultsOnInsert: true, new: true },
      );
    }
  }
}
