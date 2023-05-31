import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { ListDocument } from 'src/list/schemas/list.schema';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';

export type VendorMaterialDocument = VendorMaterial & Document;

@Schema({ timestamps: true })
export class VendorMaterial {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  vendorId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'List',
    index: true,
    default: null,
  })
  category: ListDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  descriptionAr: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'UnitOfMeasure',
    required: true,
  })
  uomSell: UnitOfMeasureDocument;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  cost: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;

  @Prop({ default: null })
  deletedAt: Date;
}

export const VendorMaterialSchema =
  SchemaFactory.createForClass(VendorMaterial);

VendorMaterialSchema.plugin(paginate);
