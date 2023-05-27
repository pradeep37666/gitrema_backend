import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';

import { MaterialDocument } from 'src/material/schemas/material.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type InventoryTransferDocument = InventoryTransfer & Document;

@Schema({ _id: false })
class Target {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    index: true,
    required: true,
  })
  targetRestaurantId: RestaurantDocument;

  @Prop({ required: true })
  stock: number;
}
const TargetSchema = SchemaFactory.createForClass(Target);

@Schema({ timestamps: true })
export class InventoryTransfer {
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
  sourceRestaurantId: RestaurantDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Material',
    index: true,
    required: true,
  })
  materialId: MaterialDocument;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    index: true,
    ref: 'UnitOfMeasure',
    required: true,
  })
  uom: UnitOfMeasureDocument[];

  @Prop({ required: true })
  stock: number;

  @Prop({ type: [TargetSchema], required: true })
  target: Target[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const InventoryTransferSchema =
  SchemaFactory.createForClass(InventoryTransfer);

InventoryTransferSchema.plugin(paginate);
