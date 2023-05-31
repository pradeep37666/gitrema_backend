import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { MaterialDocument } from 'src/material/schemas/material.schema';

import {
  MaterialItemDocument,
  MaterialItemSchema,
} from 'src/purchase-order/schemas/material-item.schema';

import { PurchaseOrderDocument } from 'src/purchase-order/schemas/purchase-order.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { VendorMaterialDocument } from 'src/vendor-material/schemas/vendor-material.schema';
import { VendorDocument } from 'src/vendor/schemas/vendor.schema';

export type SelectedVendorDocument = SelectedVendor & Document;

@Schema({ timestamps: true })
export class SelectedVendor {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    index: true,
    required: true,
  })
  restaurantId: RestaurantDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Material',
    index: true,
    required: true,
  })
  materialId: MaterialDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'VendorMaterial',
    index: true,
    default: null,
  })
  vendorMaterialId: VendorMaterialDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  vendorId: SupplierDocument;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    index: true,
    required: true,
  })
  uom: UnitOfMeasureDocument;

  @Prop({ required: true })
  isDefault: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const SelectedVendorSchema =
  SchemaFactory.createForClass(SelectedVendor);

SelectedVendorSchema.plugin(paginate);
