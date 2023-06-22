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
import { CostSimulatorDocument } from './cost-simulator.schema';

export type ProductReportDocument = ProductReport & Document;

@Schema({})
export class ProductReport {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'CostSimulator',
    required: true,
  })
  productId: CostSimulatorDocument;

  @Prop({ required: true })
  quantitiesSold: number;

  @Prop({ required: true })
  salesVolume: number;

  @Prop({ required: true })
  calculatedCost: number;

  @Prop({ required: true })
  profit: number;

  @Prop({ required: true })
  simulatedCost: number;

  @Prop({ required: true })
  simulatedProfit: number;

  @Prop({ required: true })
  profitMargin: number;

  @Prop({ required: true })
  simulatedProfitMargin: number;

  @Prop({ required: true })
  simulatedProfitChange: number;
}

export const ProductReportSchema = SchemaFactory.createForClass(ProductReport);
ProductReportSchema.plugin(paginate);
