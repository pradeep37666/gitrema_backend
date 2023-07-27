import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  Schema as MongooseSchema,
  ObjectId,
  SchemaTimestampsConfig,
} from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

import { OrderDocument } from 'src/order/schemas/order.schema';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type DeferredTransactionDocument = DeferredTransaction &
  Document &
  SchemaTimestampsConfig;

@Schema({ timestamps: true })
export class DeferredTransaction {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Restaurant',
    required: true,
  })
  restaurantId: RestaurantDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Order',
    required: true,
  })
  orderId: OrderDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Cashier',
  })
  cashierId: CashierDocument;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const DeferredTransactionSchema =
  SchemaFactory.createForClass(DeferredTransaction);
DeferredTransactionSchema.plugin(paginate);
DeferredTransactionSchema.plugin(mongooseAggregatePaginate);
