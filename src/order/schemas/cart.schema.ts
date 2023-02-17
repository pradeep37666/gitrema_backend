import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { MenuAdditionDocument } from 'src/menu/schemas/menu-addition.schema';
import * as paginate from 'mongoose-paginate-v2';

export type CartDocument = Cart & Document;

@Schema({ _id: false })
class MenuAddition {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuAddition',
    required: true,
  })
  menuAdditionId: MenuAdditionDocument;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    default: null,
  })
  options: ObjectId[];
}
const MenuAdditionSchema = SchemaFactory.createForClass(MenuAddition);

@Schema({})
export class CartItem {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  })
  menuItemId: MenuItemDocument;

  @Prop({ type: [MenuAdditionSchema] })
  additions: MenuAddition[];

  @Prop({})
  quantity: number;
}
const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: [CartItemSchema], required: true })
  cartItems: CartItem[];
}
export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.plugin(paginate);
