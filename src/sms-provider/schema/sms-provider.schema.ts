import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';

import { UserDocument } from 'src/users/schemas/users.schema';
import { Provider } from '../enum/en';

export type SmsProviderDocument = SmsProvider & Document;

@Schema({ timestamps: true })
export class SmsProvider {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: String,
    enum: Provider,
    default: Provider.Taqnyat,
  })
  provider: Provider;

  @Prop({
    type: Object,
    required: true,
  })
  credentials: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const SmsProviderSchema = SchemaFactory.createForClass(SmsProvider);
SmsProviderSchema.plugin(paginate);
