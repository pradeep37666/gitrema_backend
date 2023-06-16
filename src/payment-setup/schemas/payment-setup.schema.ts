import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';

import { UserDocument } from 'src/users/schemas/users.schema';
import { Bank } from '../enum/en.enum';

export type PaymentSetupDocument = PaymentSetup & Document;

@Schema({ timestamps: true })
export class PaymentSetup {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: Object,
    default: {
      ePayment: true,
      cashPayment: true,
      rewardsClaim: true,
      pos: true,
    },
  })
  inStore: {
    ePayment: boolean;
    cashPayment: boolean;
    rewardsClaim: boolean;
    pos: boolean;
  };

  @Prop({
    type: Object,
    default: {
      ePayment: true,
      cashPayment: false,
      rewardsClaim: true,
      pos: true,
    },
  })
  pickup: {
    ePayment: boolean;
    cashPayment: boolean;
    rewardsClaim: boolean;
    pos: boolean;
  };

  @Prop({
    type: Object,
    default: {
      ePayment: true,
      cashPayment: false,
      rewardsClaim: true,
      pos: true,
    },
  })
  delivery: {
    ePayment: boolean;
    cashPayment: boolean;
    rewardsClaim: boolean;
    pos: boolean;
  };

  @Prop({ default: null })
  bankAccountHolder: string;

  @Prop({ default: null })
  bankAccountHolderEmail: string;

  @Prop({ default: null, type: String, enum: Bank })
  bankName: Bank;

  @Prop({ default: null })
  otherBank: string;

  @Prop({ default: null })
  iban: string;

  @Prop({ default: null })
  bankIdCode: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const PaymentSetupSchema = SchemaFactory.createForClass(PaymentSetup);
PaymentSetupSchema.plugin(paginate);
