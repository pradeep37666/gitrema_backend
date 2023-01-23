import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Days, OrderTypes } from 'src/core/Constants/enum';
import * as paginate from 'mongoose-paginate-v2';

export type RestaurantDocument = Restaurant & Document;

@Schema({ _id: false })
class IndividualWorkingHours {
  @Prop({ type: String, enum: Days, required: true })
  day: Days;

  @Prop({ required: true })
  start: string;

  @Prop({ required: true })
  end: string;
}
const IndividualWorkingHoursSchema = SchemaFactory.createForClass(
  IndividualWorkingHours,
);

@Schema({ _id: false })
class TermsAndCondition {
  @Prop({ type: String, enum: OrderTypes, required: true })
  type: OrderTypes;

  @Prop({ required: true })
  termsAr: string;

  @Prop({ required: true })
  termsEn: string;
}
const TermsAndConditionSchema = SchemaFactory.createForClass(TermsAndCondition);

@Schema({ timestamps: true })
export class Restaurant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  name_ar: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: null })
  whatsappNumber: string;

  @Prop({ default: false })
  enableWhatsappCommunication: boolean;

  @Prop({ default: { en: null, ar: null }, type: Object })
  beforeConfirmOrderMessage: {
    en: string;
    ar: string;
  };

  @Prop({ required: true, type: Object })
  defaultWorkingHours: {
    start: string;
    end: string;
  };

  @Prop({ default: [], type: [IndividualWorkingHoursSchema] })
  overrideWorkingHours: IndividualWorkingHours[];

  @Prop({ default: true })
  isMenuBrowsingEnabled: boolean;

  @Prop({ default: true })
  isDeliveryEnabled: boolean;

  @Prop({ default: true })
  isPickupOrderEnabled: boolean;

  @Prop({ default: true })
  isScheduledOrderEnabled: boolean;

  @Prop({ default: true })
  isDeliveryToCarEnabled: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: [], type: [TermsAndConditionSchema] })
  terms: TermsAndCondition[];
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
RestaurantSchema.plugin(paginate);
