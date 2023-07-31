import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { CollectionType, CommonActionType } from '../enum/en';
import { UserDocument } from 'src/users/schemas/users.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: String, enum: CollectionType })
  collectionType: CollectionType;

  @Prop({
    type: String,
  })
  url: string;

  @Prop()
  message: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  recordId: ObjectId;

  @Prop({ type: Object, default: null })
  query: any;

  @Prop({ type: Object, default: null })
  body: any;

  @Prop({ type: Object, default: null })
  data: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  })
  addedBy: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    default: null,
    index: true,
  })
  supplierId: SupplierDocument;

  @Prop({ type: Object, default: {} })
  metaData: any;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.plugin(paginate);
