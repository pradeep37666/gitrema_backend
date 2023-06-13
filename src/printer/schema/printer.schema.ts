import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { PrinterType } from '../enum/en';

export type PrinterDocument = Printer & Document;

@Schema({ timestamps: true })
export class Printer {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true, index: true })
  name: string;

  @Prop({ default: null })
  nameAr: string;

  @Prop({ type: String, enum: PrinterType })
  type: PrinterType;

  @Prop()
  printerSetup: number;

  @Prop({ required: true })
  isDefault: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  addedBy: UserDocument;
}

export const PrinterSchema = SchemaFactory.createForClass(Printer);
PrinterSchema.plugin(paginate);
