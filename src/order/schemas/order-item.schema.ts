import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { MenuAdditionDocument } from 'src/menu/schemas/menu-addition.schema';
import { Alergies } from 'src/menu/enum/menu.enum';
import { CalculationType } from 'src/core/Constants/enum';

export type OrderItemDocument = OrderItem & Document;

@Schema({ _id: false })
class AdditionOption {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
  })
  optionId: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: false })
  taxEnabled: boolean;

  @Prop({ default: 0 })
  tax: number;

  @Prop({})
  calory: number;
}
const AdditionOptionSchema = SchemaFactory.createForClass(AdditionOption);

@Schema({ _id: false })
class MenuAddition {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuAddition',
    required: true,
  })
  menuAdditionId: MenuAdditionDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ type: [AdditionOptionSchema] })
  options: AdditionOption[];
}
const MenuAdditionSchema = SchemaFactory.createForClass(MenuAddition);

@Schema({ _id: false })
class MenuItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  })
  menuItemId: MenuItemDocument;

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

  @Prop({ default: false })
  taxEnabled: boolean;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: null })
  priceInStar: number;

  @Prop({ default: null })
  starGain: number;

  @Prop({ default: null })
  calories: number;

  @Prop({ default: null })
  image: string;

  @Prop({ type: [String], enum: Alergies })
  alergies: Alergies[];

  @Prop({ default: null, type: Object })
  discount: {
    type: CalculationType;
    value: number;
  };
}
const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

@Schema({})
export class OrderItem {
  @Prop({ type: MenuItemSchema, required: true })
  menuItem: MenuItem;

  @Prop({ type: [MenuAdditionSchema] })
  additions: MenuAddition[];

  @Prop({ required: true })
  netPrice: number;

  @Prop({ required: false })
  discount: number;

  @Prop({ required: true })
  priceAfterDiscount: number;

  @Prop({ required: false })
  gross: number;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ required: true })
  itemTotal: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: null })
  notes: string;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
