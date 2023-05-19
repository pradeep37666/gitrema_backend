import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ListDocument } from 'src/list/schemas/list.schema';

import { MaterialDocument } from 'src/material/schemas/material.schema';
import {
  UnitOfMeasure,
  UnitOfMeasureDocument,
} from 'src/unit-of-measure/schemas/unit-of-measure.schema';

export type MaterialItemDocument = MaterialItem & Document;

@Schema({})
export class MaterialItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Material',
    index: true,
    required: true,
  })
  materialId: MaterialDocument;

  @Prop({ required: true })
  stock: number;

  @Prop({})
  appliedStock: number;

  @Prop({})
  tax: number;

  @Prop({})
  cost: number;

  @Prop({ default: null })
  stockValue: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    index: true,
    default: null,
  })
  uom: UnitOfMeasureDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    index: true,
  })
  baseUom: UnitOfMeasureDocument;

  @Prop({})
  baseUomStock: number;

  @Prop({})
  baseUomCost: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'List',
    index: true,
    default: null,
  })
  storageArea: ListDocument;
}

export const MaterialItemSchema = SchemaFactory.createForClass(MaterialItem);
