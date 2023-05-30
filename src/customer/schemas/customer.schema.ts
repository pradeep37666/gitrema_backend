import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';

import { RoleDocument } from 'src/role/schemas/roles.schema';

import { UserDocument } from 'src/users/schemas/users.schema';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  email: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Role',
    default: null,
  })
  role: RoleDocument;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
  })
  addedBy: UserDocument;

  @Prop({ default: null })
  expoToken: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.plugin(paginate);
