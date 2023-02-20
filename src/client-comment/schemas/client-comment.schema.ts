import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { CustomerDocument } from 'src/customer/schemas/customer.schema';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { OrderDocument } from 'src/order/schemas/order.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { UserDocument } from 'src/users/schemas/users.schema';

export type ClientCommentDocument = ClientComment & Document;

@Schema({ timestamps: true })
export class ClientComment {
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
    required: true,
  })
  restaurantId: RestaurantDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Order',
    index: true,
    required: true,
  })
  orderId: OrderDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MenuItem',
    index: true,
    required: true,
  })
  menuItemId: MenuItemDocument;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: null })
  showOnPortal: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  customerId: CustomerDocument;
}
export const ClientCommentSchema = SchemaFactory.createForClass(ClientComment);
ClientCommentSchema.plugin(paginate);
