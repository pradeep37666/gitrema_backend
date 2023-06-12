import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { MaterialDocument } from 'src/material/schemas/material.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type CostSimulatorDocument = CostSimulator & Document;

@Schema({ timestamps: true })
export class CostSimulator {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplierId: SupplierDocument;

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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
  })
  addedBy: UserDocument;
}
