import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { MenuCategoryDocument } from './menu-category.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { Alergies, MenuSticker, MenuStickerStyle } from '../enum/en.enum';
import { UserDocument } from 'src/users/schemas/users.schema';
import { MenuAdditionDocument } from './menu-addition.schema';
import { CalculationType } from 'src/core/Constants/enum';
import { ImportDocument } from 'src/import/schemas/import.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { hideFromMarketDefaultValues ,menuItemsPricesDefaultValues } from 'src/core/Constants/market.contants';

export type MenuItemDocument = MenuItem & Document;

@Schema({ _id: false })
export class HideFromMarket {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: boolean;
}
export const HideFromMarketSchema = SchemaFactory.createForClass(
  HideFromMarket,
);
@Schema({ _id: false })
export class SoldOutFromMarket {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: boolean;
}
export const SoldOutFromMarketSchema = SchemaFactory.createForClass(
  SoldOutFromMarket,
);
@Schema({ _id: false })
export class MenuItemsPricesForMarkets {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;
}
export const  MenuItemsPricesForMarketsSchema = SchemaFactory.createForClass(
  MenuItemsPricesForMarkets,
);

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
    index: true,
    ref: 'UnitOfMeasure',
    default: null,
  })
  uomSell: UnitOfMeasureDocument;

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

  @Prop({ default: hideFromMarketDefaultValues, type: [{type:HideFromMarketSchema}] })
  hideFromMarkets: HideFromMarket[];

  @Prop({ default: hideFromMarketDefaultValues, type: [{type:SoldOutFromMarketSchema}] })
  soldOutFromMarkets: SoldOutFromMarket[];

  @Prop({ default: menuItemsPricesDefaultValues, type: [{type:MenuItemsPricesForMarketsSchema}] })
  pricesForMarkets: MenuItemsPricesForMarkets[];

  @Prop({ default: false })
  soldOut: boolean;

  @Prop({ default: false })
  manageQuantity: boolean;

  @Prop({ default: false })
  canBuyWithStars: boolean;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'MenuAddition',
    index: true,
    default: [],
  })
  additions: MenuAdditionDocument[];

  @Prop({ type: String, enum: Object.values(MenuSticker).concat([null]) })
  sticker: MenuSticker;

  @Prop({
    type: [String],
    enum: Object.values(MenuStickerStyle).concat([null]),
  })
  stickerStyle: MenuStickerStyle[];

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ default: 0 })
  preparationTime: number;

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

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
MenuItemSchema.plugin(paginate);
