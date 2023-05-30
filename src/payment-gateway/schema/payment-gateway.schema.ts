import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';

import { UserDocument } from 'src/users/schemas/users.schema';
import { PaymentGateways } from '../enum/en';

import { AlrahjiCredentialsDto } from '../dto/alrahji-credentials.dto';

export type PaymentGatewayDocument = PaymentGateway & Document;

@Schema({ timestamps: true })
export class PaymentGateway {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: String,
    enum: PaymentGateways,
    default: PaymentGateways.Alrahji,
  })
  gateway: PaymentGateways;

  @Prop({
    type: Object,
    required: true,
  })
  credentials: AlrahjiCredentialsDto;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const PaymentGatewaySchema =
  SchemaFactory.createForClass(PaymentGateway);
PaymentGatewaySchema.plugin(paginate);
