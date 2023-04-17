import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ImportDocument } from 'src/import/schemas/import.schema';
import { OrderType } from 'src/order/enum/en.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import {
  Attachments,
  NotificationType,
  OrderEvents,
  RecipientTypes,
} from '../enum/en.enum';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({ type: [String], enum: NotificationType })
  channels: NotificationType[];

  @Prop({ type: String, enum: OrderType })
  orderType: OrderType;

  @Prop({})
  content: string;

  @Prop({ default: null })
  subject: string;

  @Prop({ type: [String], enum: OrderEvents })
  events: OrderEvents[];

  @Prop({ type: [String], enum: RecipientTypes })
  recipientTypes: RecipientTypes[];

  @Prop({ type: [String], enum: Attachments })
  attachments: Attachments[];

  @Prop({ default: [] })
  customRecipients: string[];

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.plugin(paginate);
