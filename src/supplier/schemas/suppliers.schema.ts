import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import {
  SubscriptionFrequency,
  SubscriptionType,
} from 'src/core/Constants/enum';
import { UserDocument } from 'src/users/schemas/users.schema';

export type SupplierDocument = Supplier & Document;

@Schema({ _id: false })
export class BusinessDetails {
  @Prop({ type: Object })
  slogan: {
    title: string;
    description: string;
  };

  @Prop({ type: Object })
  about: {
    title: string;
    description: string;
  };

  @Prop({ type: Object })
  singleProperty: {
    title: string;
    description: string;
  };

  @Prop({ type: Object })
  multipleProperty: {
    title: string;
    description: string;
  };

  @Prop({ type: Object, default: {} })
  additionalDetails: any;
}

export const BusinessDetailsSchema =
  SchemaFactory.createForClass(BusinessDetails);

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  crNumber: string;

  @Prop({ default: null })
  vatNumber: string;

  @Prop({ type: Object, default: {} })
  contact: {
    name: string;
    phoneNumber: string;
    whatsappNumber: string;
  };

  @Prop({ type: Object, default: {} })
  propertyManager: {
    name: string;
    phoneNumber: string;
    whatsappNumber: string;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: null })
  subscriptionDetails: {
    validTill: Date;
    name: string;
    type: SubscriptionType;
    frequency: SubscriptionFrequency;
    amount: number;
  };

  @Prop({ type: Object, default: null })
  bankDetais: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
  };

  @Prop({ type: BusinessDetailsSchema, default: {} })
  businessDetails: BusinessDetails;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: null })
  timezone: string;

  @Prop({ type: String })
  district: string;

  @Prop({ default: null })
  currency: string;

  @Prop({ default: null })
  domain: string;

  @Prop({ type: Boolean, default: false })
  spn: boolean;

  @Prop({ type: Boolean, default: true })
  hotel: boolean;

  @Prop({ type: Boolean, default: false })
  affiliate: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Admin',
  })
  addedBy: UserDocument;

  @Prop({ default: null })
  deletedAt: Date;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);

SupplierSchema.plugin(paginate);
