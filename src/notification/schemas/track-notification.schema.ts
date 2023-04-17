import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ImportDocument } from 'src/import/schemas/import.schema';
import { OrderType } from 'src/order/enum/en.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import {
  NotificationStatus,
  OrderEvents,
  RecipientTypes,
} from '../enum/en.enum';
import { NotificationDocument } from './notification.schema';

export type TrackNotificationDocument = TrackNotification & Document;

@Schema({ timestamps: true })
export class TrackNotification {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Notification',
    index: true,
    required: true,
  })
  notificationId: NotificationDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    required: true,
  })
  dataId: ObjectId;

  @Prop({})
  sentOn: string;

  @Prop({})
  content: string;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({
    type: String,
    enum: NotificationStatus,
    default: NotificationStatus.Pending,
  })
  status: NotificationStatus;
}

export const TrackNotificationSchema =
  SchemaFactory.createForClass(TrackNotification);
TrackNotificationSchema.plugin(paginate);
