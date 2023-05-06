import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { ListDocument } from 'src/list/schemas/list.schema';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { AllMeasuresUnits } from 'convert-units';

export type UnitOfMeasureDocument = UnitOfMeasure & Document;

@Schema({ timestamps: true })
export class UnitOfMeasure {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    default: null,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ type: String })
  abbr: AllMeasuresUnits;

  @Prop({})
  measure: string;

  @Prop({})
  system: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
    ref: 'UnitOfMeasure',
  })
  baseUnit: UnitOfMeasureDocument;

  @Prop({
    default: null,
  })
  baseConversionRate: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
  })
  addedBy: UserDocument;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UnitOfMeasureSchema = SchemaFactory.createForClass(UnitOfMeasure);

UnitOfMeasureSchema.plugin(paginate);
