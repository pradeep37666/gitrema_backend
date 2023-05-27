import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ListDocument } from 'src/list/schemas/list.schema';

import { MaterialDocument } from 'src/material/schemas/material.schema';
import {
  UnitOfMeasure,
  UnitOfMeasureDocument,
} from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { VendorMaterialDocument } from 'src/vendor-material/schemas/vendor-material.schema';

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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'VendorMaterial',
    index: true,
    default: null,
  })
  vendorMaterialId: VendorMaterialDocument;

  @Prop({ required: true })
  stock: number;

  @Prop({})
  appliedStock: number;

  @Prop({})
  tax: number;

  @Prop({})
  cost: number;

  @Prop({})
  netPrice: number;

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

  @Prop()
  expirationDate: Date;
}

export const MaterialItemSchema = SchemaFactory.createForClass(MaterialItem);
