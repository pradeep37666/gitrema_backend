import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { PaymentGateways } from 'src/payment-gateway/enum/en';

export type GlobalConfigDocument = GlobalConfig & Document;

@Schema({ timestamps: true })
export class GlobalConfig {
  @Prop({})
  deliveryMargin: number;

  @Prop({})
  payoutDay: number;

  @Prop({})
  lowInventoryNotificationTime: string;

  @Prop({})
  lastLowInventoryNotificationSentAt: Date;

  @Prop({ type: String, enum: PaymentGateways })
  paymentGateway: PaymentGateways;
}
export const GlobalConfigSchema = SchemaFactory.createForClass(GlobalConfig);
GlobalConfigSchema.plugin(paginate);
