import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { MenuCategoryDocument } from './menu-category.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { Alergies, MenuSticker, MenuStickerStyle } from '../enum/menu.enum';
import { UserDocument } from 'src/users/schemas/users.schema';
import { MenuAdditionDocument } from './menu-addition.schema';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    index: true,
    default: null,
  })
  restaurantId: RestaurantDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuCategory',
    index: true,
    required: true,
  })
  categoryId: MenuCategoryDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  description_ar: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: null })
  priceInStar: number;

  @Prop({ default: null })
  starGain: number;

  @Prop({ default: null })
  calories: number;

  @Prop({ default: null })
  image: string;

  @Prop({ required: true })
  waiterCode: string;

  @Prop({ type: [String], enum: Alergies })
  alergies: Alergies[];

  @Prop({ default: 0 })
  quantity: number;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'MenuItem',
    index: true,
    default: [],
  })
  suggestedItems: MenuItemDocument[];

  @Prop({ default: false })
  hideFromMenu: boolean;

  @Prop({ default: false })
  soldOut: boolean;

  @Prop({ default: false })
  canBuyWithStars: boolean;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'MenuAddition',
    index: true,
    default: [],
  })
  additions: MenuAdditionDocument[];

  @Prop({ type: String, enum: MenuSticker })
  sticker: MenuSticker;

  @Prop({ type: [String], enum: MenuStickerStyle })
  stickerStyle: MenuStickerStyle[];

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.plugin(paginate);
