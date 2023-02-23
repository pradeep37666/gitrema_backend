import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { PaymentSetupDocument } from 'src/payment-setup/schemas/payment-setup.schema';
import {
  IndividualWorkingHours,
  IndividualWorkingHoursSchema,
  RestaurantDocument,
} from 'src/restaurant/schemas/restaurant.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type SupplierDocument = Supplier & Document;

export interface SupplierAggregated extends Supplier {
  paymentsetups: PaymentSetupDocument[];
  cashiers: CashierDocument[];
  restaurants: RestaurantDocument[];
  kitchenqueues: KitchenQueueDocument[];
  totalRestaurants: number;
  totalPaymentsetups: number;
  totalCashiers: number;
  totalKitchens: number;
}

@Schema({ timestamps: true })
export class Supplier {
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

  @Prop({ default: false })
  taxEnabled: boolean;

  @Prop({ default: 0 })
  taxRate: number;

  @Prop({ default: 0 })
  reservationFee: number;

  @Prop({ default: false })
  taxEnabledOnReservationFee: boolean;

  @Prop({ default: false })
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

  @Prop({ required: true, type: Object })
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
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
SupplierSchema.plugin(paginate);
