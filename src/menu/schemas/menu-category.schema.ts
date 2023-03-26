import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ImportDocument } from 'src/import/schemas/import.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type MenuCategoryDocument = MenuCategory & Document;

@Schema({ timestamps: true })
export class MenuCategory {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: null })
  image: string;

  @Prop({ required: true })
  order: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Import',
  })
  importId: ImportDocument;
}

export const MenuCategorySchema = SchemaFactory.createForClass(MenuCategory);
MenuCategorySchema.plugin(paginate);
