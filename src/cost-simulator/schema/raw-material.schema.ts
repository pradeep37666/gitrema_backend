import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MaterialDocument } from 'src/material/schemas/material.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import * as paginate from 'mongoose-paginate-v2';
import {
  RecipeSimulationMaterial,
  RecipeSimulationMaterialSchema,
} from './recipe-simulation-material.schema';

export type RawMaterialDocument = RawMaterial & Document;

@Schema({})
export class RawMaterial {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    required: true,
  })
  uom: UnitOfMeasureDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: 0 })
  changeSimulation: number;

  @Prop({ required: true })
  simulatedPrice: number;

  @Prop({ type: [RecipeSimulationMaterialSchema], default: [] })
  components: RecipeSimulationMaterial[];
}

export const RawMaterialSchema = SchemaFactory.createForClass(RawMaterial);
RawMaterialSchema.plugin(paginate);
