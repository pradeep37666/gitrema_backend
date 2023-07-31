import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type RequestLogDocument = RequestLog & Document;

@Schema({ timestamps: true })
export class RequestLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Object, default: null })
  query: object;

  @Prop({ type: Object, default: null })
  body: object;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  user: UserDocument;
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog);

RequestLogSchema.plugin(paginate);
