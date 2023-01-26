import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  CustomEvent,
  EmailAttachments,
  EmailTemplateEvent,
  NotificationRecipients,
  TriggerType,
} from 'src/core/Constants/enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import * as paginate from 'mongoose-paginate-v2';

export type EmailTemplateDocument = EmailTemplate & Document;

@Schema({ timestamps: true })
export class EmailTemplate {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  body: string;

  @Prop({ index: true, type: String, enum: EmailTemplateEvent })
  event: EmailTemplateEvent;

  @Prop({ type: String, enum: TriggerType })
  trigger: TriggerType;

  @Prop({ default: 0 })
  hours: number;

  @Prop({ type: [String], default: [] })
  attachments: EmailAttachments[];

  @Prop({ type: [String], enum: NotificationRecipients, required: true })
  recipients: NotificationRecipients[];

  @Prop({ default: null })
  replyTo: string;

  @Prop({ type: [String], default: [] })
  cc: string[];

  @Prop({ default: false })
  default: boolean;

  @Prop({ type: String, enum: CustomEvent })
  slug: CustomEvent;

  @Prop({ default: false })
  isSystem: boolean;

  @Prop({ default: true })
  isActive: boolean;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
EmailTemplateSchema.plugin(paginate);
