import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { MenuCategoryDocument } from './menu-category.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { Alergies, MenuSticker, MenuStickerStyle } from '../enum/menu.enum';
import { UserDocument } from 'src/users/schemas/users.schema';
import { MenuAdditionDocument } from './menu-addition.schema';
import { CalculationType } from 'src/core/Constants/enum';

export type MenuItemDocument = MenuItem & Document;

@Schema({ _id: false })
export class Quantity {
  @Prop({ required: true })
  quantity: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    index: true,
    required: true,
  })
  restaurantId: RestaurantDocument;
}
const QuantitySchema = SchemaFactory.createForClass(Quantity);

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
  descriptionAr: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  cost: number;

  @Prop({ default: false })
  taxEnabled: boolean;

  @Prop({ default: null })
  priceInStar: number;

  @Prop({ default: null })
  starGain: number;

  @Prop({ default: null })
  order: number;

  @Prop({ default: null })
  calories: number;

  @Prop({ default: null })
  image: string;

  @Prop({ default: null })
  waiterCode: string;

  @Prop({ type: [String], enum: Alergies })
  alergies: Alergies[];

  @Prop({ default: [], type: [QuantitySchema] })
  quantities: Quantity[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'MenuItem',
    index: true,
    default: [],
  })
  suggestedItems: MenuItemDocument[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Restaurant',
    index: true,
    default: [],
  })
  hideFromMenu: RestaurantDocument[];

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

  @Prop({ default: true })
  isTaxable: boolean;

  @Prop({ type: Object, default: null })
  discount: {
    type: CalculationType;
    value: number;
  };

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.plugin(paginate);
