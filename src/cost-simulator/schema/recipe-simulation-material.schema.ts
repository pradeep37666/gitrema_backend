import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Schema as MongooseSchema } from 'mongoose';
import { MaterialDocument } from 'src/material/schemas/material.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { RawMaterialDocument } from './raw-material.schema';

@Schema({})
export class RecipeSimulationMaterial {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'RawMaterial',
    index: true,
    required: true,
  })
  materialId: RawMaterialDocument;

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

export const RecipeSimulationMaterialSchema = SchemaFactory.createForClass(
  RecipeSimulationMaterial,
);
