import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { UserDocument } from 'src/users/schemas/users.schema';
import { ActivitySubject, ActivityType } from '../enum/activity.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

export type ActivityDocument = Activity & Document;

@Schema({ timestamps: true })
export class Activity {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  dataId: ObjectId;

  @Prop({ type: String, enum: ActivitySubject, required: true })
  subject: ActivitySubject;

  @Prop({ type: String, enum: ActivityType, required: true })
  type: ActivityType;

  @Prop({ type: Object, required: true })
  data: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  })
  addedBy: UserDocument;
}
export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.plugin(paginate);
