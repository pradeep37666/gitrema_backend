import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { UserDocument } from 'src/users/schemas/users.schema';
import { AnswerOption } from '../enum/en.enum';

export type ClientFeedbackDocument = ClientFeedback & Document;

@Schema({})
class Question {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  questionAr: string;

  @Prop({ required: true, type: String, enum: AnswerOption })
  answerOption: AnswerOption;

  @Prop({ default: true })
  active: boolean;
}
const QuestionSchema = SchemaFactory.createForClass(Question);

@Schema({ timestamps: true })
export class ClientFeedback {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: [QuestionSchema] })
  questions: Question[];

  @Prop({ default: false })
  active: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}
export const ClientFeedbackSchema =
  SchemaFactory.createForClass(ClientFeedback);
ClientFeedbackSchema.plugin(paginate);
