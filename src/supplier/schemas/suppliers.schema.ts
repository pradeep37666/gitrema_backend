import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { TIMEZONE } from 'src/core/Constants/system.constant';
import { Tax } from 'src/core/Constants/tax-rate.constant';
import { ImportDocument } from 'src/import/schemas/import.schema';
import {
  IndividualWorkingHours,
  IndividualWorkingHoursSchema,
} from 'src/restaurant/schemas/restaurant.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { SupplierType } from '../enum/en';

export type SupplierDocument = Supplier & Document;

@Schema({ timestamps: true })
export class Supplier {
  @Prop({ required: true })
  alias: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: null })
  nameAr: string;

  @Prop({ default: null })
  about: string;

  @Prop({ default: null })
  aboutAr: string;

  @Prop({ default: null })
  vatNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: null })
  phoneNumber: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: null })
  backgroundImage: string;

  @Prop({ default: null })
  twitter: string;

  @Prop({ default: null })
  instagram: string;

  @Prop({ default: null })
  snapchat: string;

  @Prop({ default: null })
  tiktok: string;

  @Prop({ default: null })
  whatsapp: string;

  @Prop({ default: null })
  domain: string;

  @Prop({ default: true })
  restaurant: boolean;

  @Prop({ default: null })
  crDoc: string;

  @Prop({ default: null })
  mancucpilityCertDoc: string;

  @Prop({ default: null })
  incorporationContractDoc: string;

  @Prop({ default: null })
  ibanCertDoc: string;

  @Prop({ default: null })
  idDoc: string;

  @Prop({ default: true })
  taxEnabled: boolean;

  @Prop({ default: Tax.rate })
  taxRate: number;

  @Prop({ default: 0 })
  reservationFee: number;

  @Prop({ default: true })
  taxEnabledOnReservationFee: boolean;

  @Prop({ default: true })
  taxEnabledOnTableFee: boolean;

  @Prop({ default: true })
  isMenuBrowsingEnabled: boolean;

  @Prop({ default: true })
  isAppOrderEnabled: boolean;

  @Prop({ default: true })
  isDeliveryEnabled: boolean;

  @Prop({ default: true })
  isPickupOrderEnabled: boolean;

  @Prop({ default: true })
  isScheduledOrderEnabled: boolean;

  @Prop({ default: true })
  isDeliveryToCarEnabled: boolean;

  @Prop({ default: true })
  isReservationEnabled: boolean;

  @Prop({ default: true })
  isWaitingEnabled: boolean;

  @Prop({ default: { start: '08:00', end: '22:00' }, type: Object })
  defaultWorkingHours: {
    start: string;
    end: string;
  };

  @Prop({ default: [], type: [IndividualWorkingHoursSchema] })
  overrideWorkingHours: IndividualWorkingHours[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  addedBy: UserDocument;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: TIMEZONE })
  timezone: string;

  @Prop({ type: String, enum: SupplierType })
  type: SupplierType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Import',
    default: null,
  })
  importId: ImportDocument;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.plugin(paginate);
