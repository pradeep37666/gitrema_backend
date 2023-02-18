import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { CustomerDocument } from 'src/customer/schemas/customer.schema';
import { ClientFeedbackDocument } from './client-feedback.schema';

export type ClientFeedbackAnswerDocument = ClientFeedbackAnswer & Document;

@Schema({})
class Answer {
  @Prop({ required: true })
  questionId: string;

  @Prop({ required: true })
  answer: string;
}
const AnswerSchema = SchemaFactory.createForClass(Answer);

@Schema({ timestamps: true })
export class ClientFeedbackAnswer {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  })
  customerId: CustomerDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ClientFeedback',
    required: true,
  })
  feedbackId: ClientFeedbackDocument;

  @Prop({ required: true, type: [AnswerSchema] })
  answers: Answer[];
}
export const ClientFeedbackAnswerSchema =
  SchemaFactory.createForClass(ClientFeedbackAnswer);
ClientFeedbackAnswerSchema.plugin(paginate);
