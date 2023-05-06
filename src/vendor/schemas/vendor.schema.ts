import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { VendorType } from '../enum/en';

export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: null })
  email: string;

  @Prop({ default: null })
  phoneNumber: string;

  @Prop({ default: null })
  address: string;

  @Prop({ default: null })
  contactPerson: string;

  @Prop({ default: VendorType.External, type: String, enum: VendorType })
  type: VendorType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
  })
  addedBy: VendorDocument;

  @Prop({ default: null })
  deletedAt: Date;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

VendorSchema.plugin(paginate);
