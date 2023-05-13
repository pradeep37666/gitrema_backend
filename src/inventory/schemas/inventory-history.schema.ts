import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { ListDocument } from 'src/list/schemas/list.schema';
import { MaterialDocument } from 'src/material/schemas/material.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { InventoryAction } from '../enum/en';

export type InventoryHistoryDocument = InventoryHistory & Document;

@Schema({ timestamps: true })
export class InventoryHistory {
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

    index: true,
    default: null,
  })
  dataId: ObjectId;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    index: true,
    ref: 'UnitOfMeasure',
    required: true,
  })
  uomInventory: UnitOfMeasureDocument[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    required: true,
  })
  uomBase: UnitOfMeasureDocument;

  @Prop({ default: 0 })
  conversionFactor: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 0 })
  stockValue: number;

  @Prop({ default: 0 })
  cost: number;

  @Prop({ required: true, type: String, enum: InventoryAction })
  action: InventoryAction;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  modifiedBy: UserDocument;
}

export const InventoryHistorySchema =
  SchemaFactory.createForClass(InventoryHistory);

InventoryHistorySchema.plugin(paginate);
