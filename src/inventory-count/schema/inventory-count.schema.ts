import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import { UserDocument } from 'src/users/schemas/users.schema';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { RecipeDocument } from 'src/recipe/schema/recipe.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { InventoryCountStatus } from '../enum/en';
import * as paginate from 'mongoose-paginate-v2';

export type InventoryCountDocument = InventoryCount & Document;

@Schema({ _id: false })
class ManualCount {
  @Prop({ required: true })
  quantity: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    required: true,
  })
  uom: UnitOfMeasureDocument;
}

const ManualCountSchema = SchemaFactory.createForClass(ManualCount);

@Schema({ timestamps: true })
export class InventoryCount {
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

  @Prop({ type: [ManualCountSchema], default: [] })
  count: ManualCount[];

  @Prop({ default: null })
  countValue: number;

  @Prop({ default: null })
  onHandCount: number;

  @Prop({ default: null })
  onHandCountValue: number;

  @Prop({ default: null })
  differentialCount: number;

  @Prop({ default: null })
  differentialCountValue: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    required: true,
  })
  uomBase: UnitOfMeasureDocument;

  @Prop({
    type: String,
    enum: InventoryCountStatus,
    default: InventoryCountStatus.New,
  })
  status: InventoryCountStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const InventoryCountSchema =
  SchemaFactory.createForClass(InventoryCount);

InventoryCountSchema.plugin(paginate);
