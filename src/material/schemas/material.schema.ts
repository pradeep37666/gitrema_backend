import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { MaterialType, UnitOfMeasure, ProcurementType } from '../enum/en';
import { ListDocument } from 'src/list/schemas/list.schema';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';

export type MaterialDocument = Material & Document;

@Schema({ timestamps: true })
export class Material {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    index: true,
    default: null,
  })
  menuItemId: MenuItemDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    index: true,
    default: null,
  })
  category: ListDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  descriptionAr: string;

  @Prop({ required: true, type: String, enum: MaterialType })
  materialType: MaterialType;

  @Prop({ required: true, type: String, enum: ProcurementType })
  procurementType: ProcurementType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    default: null,
  })
  uomSell: UnitOfMeasureDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    default: null,
  })
  uomBuy: UnitOfMeasureDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    default: null,
  })
  uomRecipe: UnitOfMeasureDocument;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    index: true,
    ref: 'UnitOfMeasure',
    default: null,
  })
  uomInventory: UnitOfMeasureDocument[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    default: null,
  })
  uomBase: UnitOfMeasureDocument;

  @Prop({ default: false })
  isQuantityManaged: boolean; // if true menuItemId should be required -> Add validation

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;

  @Prop({ default: null })
  deletedAt: Date;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);

MaterialSchema.plugin(paginate);
