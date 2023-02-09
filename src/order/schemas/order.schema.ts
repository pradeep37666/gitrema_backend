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
import {
  InvoiceStatus,
  OrderStatus,
  OrderType,
  PaymentStatus,
  Source,
} from '../enum/en.enum';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import {
  OrderItem,
  OrderItemDocument,
  OrderItemSchema,
} from './order-item.schema';
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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
  })
  groupId: string;

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

  @Prop({ default: false })
  isGrouped: boolean;

  @Prop({ default: null })
  scheduledDateTime: Date;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItemDocument[];

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.NotPaid })
  paymentStatus: PaymentStatus;

  @Prop({ type: String, enum: InvoiceStatus })
  invoiceStatus: InvoiceStatus;

  @Prop({
    default: {
      fee: 0,
      tax: 0,
      netBeforeTax: 0,
    },
    type: Object,
  })
  tableFee: {
    fee: number;
    tax: number;
    netBeforeTax: number;
  };

  @Prop({
    type: Object,
    default: {
      totalBeforeDiscount: 0,
      discount: 0,
      totalWithTax: 0,
      totalTaxableAmount: 0,
      totalTax: 0,
      totalPaid: 0,
      totalRefunded: 0,
      headerDiscount: 0,
    },
  })
  summary: {
    totalBeforeDiscount: number;
    discount: number;
    totalWithTax: number;
    totalTaxableAmount: number;
    totalTax: number;
    totalPaid: number;
    totalRefunded: number;
    headerDiscount: number;
  };

  @Prop()
  taxRate: number;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Transaction',
    index: true,
    default: [],
  })
  transactions: TransactionDocument[];

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
