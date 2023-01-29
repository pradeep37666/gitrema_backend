import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { TableDocument } from 'src/table/schemas/table.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { OrderType, Source } from '../enum/order.enum';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { OrderItem, OrderItemSchema } from './order-item.schema';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  })
  restaurantId: RestaurantDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  customerId: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Table',
    default: null,
  })
  tableId: TableDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  waiterId: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'KitchenQueue',
    default: null,
  })
  kitchenQueueId: KitchenQueueDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Cashier',
    default: null,
  })
  cashierId: CashierDocument;

  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  contactNumber: string;

  @Prop({ type: String, enum: Source })
  source: Source;

  @Prop({ type: String, enum: OrderType })
  orderType: OrderType;

  @Prop({ default: false })
  isScheduled: boolean;

  @Prop({ default: null })
  scheduledDateTime: Date;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({
    type: Object,
    default: {
      subTotal: 0,
      tax: 0,
      total: 0,
      paid: 0,
    },
  })
  summary: {
    subTotal: number;
    tax: number;
    total: number;
    paid: number;
  };

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  addedBy: UserDocument;
}
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(paginate);
