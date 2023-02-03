import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  Schema as MongooseSchema,
  SchemaTimestampsConfig,
} from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { TableDocument } from 'src/table/schemas/table.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { OrderStatus, OrderType, Source } from '../enum/en.enum';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { OrderItem, OrderItemSchema } from './order-item.schema';
import { TransactionDocument } from 'src/transaction/schemas/transactions.schema';

export type OrderDocument = Order & Document & SchemaTimestampsConfig;

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

  // @Prop({ required: true })
  // orderNumber: string;

  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  contactNumber: string;

  @Prop({ type: String, enum: Source })
  source: Source;

  @Prop({ type: String, enum: OrderType })
  orderType: OrderType;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.New })
  status: OrderStatus;

  @Prop({ default: false })
  isScheduled: boolean;

  @Prop({ default: null })
  scheduledDateTime: Date;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ default: 0 })
  tableFee: number;

  @Prop({
    type: Object,
    default: {
      net: 0,
      tax: 0,
      gross: 0,
      itemTotal: 0,
      total: 0,
      discount: 0,
      tableFeeWithoutTax: 0,
      tableFee: 0,
    },
  })
  summary: {
    net: number;
    tax: number;
    gross: number;
    itemTotal: number;
    total: number;
    discount: number;
    tableFeeWithoutTax: number;
    tableFee: number;
  };

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Transaction',
    index: true,
    default: [],
  })
  transactions: TransactionDocument[];

  @Prop({ default: false })
  isPaid: boolean;

  @Prop({ default: null })
  menuQrCodeScannedTime: Date;

  @Prop({ default: null })
  sentToKitchenTime: Date;

  @Prop({ default: null })
  orderReadyTime: Date;

  @Prop({ default: null })
  paymentTime: Date;

  @Prop({ default: null })
  sittingStartTime: Date;

  @Prop({ default: null })
  couponCode: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  addedBy: UserDocument;

  @Prop({ type: Object, default: null })
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: number;
    latitude: number;
    longitude: number;
    district: string;
  };
}
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(paginate);
