import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

import {
  RecipeSimulationMaterial,
  RecipeSimulationMaterialSchema,
} from './recipe-simulation-material.schema';
import * as paginate from 'mongoose-paginate-v2';

export type CostSimulatorDocument = CostSimulator & Document;

@Schema({ timestamps: true })
export class CostSimulator {
  @Prop({ default: 1 })
  perQuantity: number;

  @Prop({ required: true })
  sellPrice: number;

  @Prop({ required: true })
  calculatedCost: number;

  @Prop({ required: true })
  simulatedCost: number;

  @Prop({ required: true })
  unitProfit: number;

  @Prop({ required: true })
  simulatedUnitProfit: number;

  @Prop({ required: true })
  profitMargin: number;

  @Prop({ required: true })
  simulatedProfitMargin: number;

  @Prop({ required: true })
  unitSimulatedProfitChange: number;

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

  @Prop({ type: [RecipeSimulationMaterialSchema], default: [] })
  components: RecipeSimulationMaterial[];
}

export const CostSimulatorSchema = SchemaFactory.createForClass(CostSimulator);
CostSimulatorSchema.plugin(paginate);
