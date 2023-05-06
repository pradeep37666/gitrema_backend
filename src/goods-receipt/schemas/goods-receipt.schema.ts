import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';

import {
  MaterialItemDocument,
  MaterialItemSchema,
} from 'src/purchase-order/schemas/material-item.schema';

import { PurchaseOrderDocument } from 'src/purchase-order/schemas/purchase-order.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type GoodsReceiptDocument = GoodsReceipt & Document;

@Schema({ timestamps: true })
export class GoodsReceipt {
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
    ref: 'PurchaseOrder',
    index: true,
    required: true,
  })
  purchaseOrderId: PurchaseOrderDocument;

  @Prop({ default: null })
  url: string;

  @Prop({ type: [MaterialItemSchema], required: true })
  items: MaterialItemDocument[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;

  @Prop({ default: null })
  deletedAt: Date;
}

export const GoodsReceiptSchema = SchemaFactory.createForClass(GoodsReceipt);

GoodsReceiptSchema.plugin(paginate);
