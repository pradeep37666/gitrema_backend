import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { FeatureDocument } from 'src/feature/schemas/feature.schema';
import { PackageDocument } from 'src/package/schemas/package.schema';

import { UserDocument } from 'src/users/schemas/users.schema';
import { SupplierDocument } from './suppliers.schema';
import { TransactionDocument } from 'src/transaction/schemas/transactions.schema';

export type SupplierPackageDocument = SupplierPackage & Document;

@Schema({ timestamps: true })
export class SupplierPackage {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Package',
    required: true,
  })
  packageId: PackageDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  nameAr: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  days: number;

  @Prop({ default: 0 })
  gracePeriod: number;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Feature',
    required: true,
  })
  features: FeatureDocument[];

  @Prop({ default: null })
  deliveryMargin: number;

  @Prop({})
  subscriptionStartingDate: Date;

  @Prop({})
  subscriptionExpiryDate: Date;

  @Prop({})
  subscriptionExpiryDateWithGrace: Date;

  @Prop({ default: 0 })
  trialPeriod: number;

  @Prop({})
  trialPeriodStartingDate: Date;

  @Prop({})
  trialPeriodExpiryDate: Date;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Transaction',
    index: true,
    default: [],
  })
  transactions: TransactionDocument[];

  @Prop({
    type: [String],
    default: [],
  })
  receipts: string[];

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  isPaymentDue: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const SupplierPackageSchema =
  SchemaFactory.createForClass(SupplierPackage);

SupplierPackageSchema.plugin(paginate);
