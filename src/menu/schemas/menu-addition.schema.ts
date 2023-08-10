import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { AutoCachePlugin } from 'src/cache/plugin/auto-cache.plugin';
import { menuItemsPricesDefaultValues } from 'src/core/Constants/market.contants';
import { MarketPlace } from 'src/market-place/shemas/market-place.schem';
import { MarketType } from 'src/order/enum/en.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type MenuAdditionDocument = MenuAddition & Document;

type AdditionOptionDocument = AdditionOption & Document;

@Schema({ _id: false })
class AdditionMarketPrices {
  @Prop({ required: true })
  name: MarketType;

  @Prop({ default: 0 })
  price: number;
}
const AdditionMarketPricesSchema =
  SchemaFactory.createForClass(AdditionMarketPrices);

@Schema({})
class AdditionOption {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({
    default: menuItemsPricesDefaultValues,
    type: [AdditionMarketPricesSchema],
  })
  marketPrices: AdditionMarketPrices[];

  @Prop({})
  order: number;

  @Prop({})
  calory: number;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  default: boolean;
}
const AdditionOptionSchema = SchemaFactory.createForClass(AdditionOption);

@Schema({ timestamps: true })
export class MenuAddition {
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

  @Prop({ default: false })
  isMultipleAllowed: boolean;

  @Prop({ type: [AdditionOptionSchema] })
  options: AdditionOptionDocument[];

  @Prop({ default: null })
  maxOptions: number;

  @Prop({ default: null })
  minOptions: number;

  @Prop({ default: null })
  freeOptions: number;

  @Prop({})
  order: number;

  @Prop({ default: false })
  taxEnabled: boolean;

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

export const MenuAdditionSchema = SchemaFactory.createForClass(MenuAddition);
MenuAdditionSchema.plugin(paginate);
MenuAdditionSchema.plugin(AutoCachePlugin);
