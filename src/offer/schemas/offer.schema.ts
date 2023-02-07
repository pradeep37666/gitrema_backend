import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { CalculationType } from 'src/core/Constants/enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { ApplicationType, OfferType } from '../enum/en.enum';
import { UserDocument } from 'src/users/schemas/users.schema';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { MenuCategoryDocument } from 'src/menu/schemas/menu-category.schema';

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true })
export class Offer {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ required: true })
  start: Date;

  @Prop({ required: true })
  end: Date;

  @Prop({ default: null })
  code: string;

  @Prop({ required: true, type: String, enum: OfferType })
  offerType: OfferType;

  @Prop({ required: true, type: String, enum: ApplicationType })
  applicationType: ApplicationType;

  @Prop({ required: true, type: String, enum: CalculationType })
  discountType: CalculationType;

  @Prop({ required: true })
  discount: number;

  @Prop({ default: null })
  maxDiscount: number;

  @Prop({ default: null })
  maxNumberAllowed: number;

  @Prop({ default: 0 })
  totalUsed: number;

  @Prop({ default: null })
  startTime: string;

  @Prop({ default: null })
  endTime: string;

  @Prop({ default: false })
  showName: boolean;

  @Prop({ default: null })
  priority: number;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'MenuItem',
    index: true,
    default: [],
  })
  menuItemIds: MenuItemDocument[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'MenuCategory',
    index: true,
    default: [],
  })
  menuCategoryIds: MenuCategoryDocument[];

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
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
OfferSchema.plugin(paginate);
