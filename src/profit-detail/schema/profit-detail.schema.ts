import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  Schema as MongooseSchema,
  SchemaTimestampsConfig,
} from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { MaterialDocument } from 'src/material/schemas/material.schema';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { OrderDocument } from 'src/order/schemas/order.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

export type ProfitDetailDocument = ProfitDetail &
  Document &
  SchemaTimestampsConfig;

@Schema({ timestamps: true })
export class ProfitDetail {
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
    ref: 'Order',
    index: true,
    required: true,
  })
  orderId: OrderDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    index: true,
    required: true,
  })
  menuItemId: MenuItemDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Material',
    index: true,
    required: true,
  })
  materialId: MaterialDocument;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: null })
  unitPrice: number;

  @Prop({ default: null })
  totalPrice: number;

  @Prop({})
  unitCost: number;

  @Prop({ default: null })
  totalCost: number;

  @Prop({ default: null })
  profit: number;

  @Prop({ default: null })
  paymentStatus: string;
}

export const ProfitDetailSchema = SchemaFactory.createForClass(ProfitDetail);

ProfitDetailSchema.plugin(paginate);
