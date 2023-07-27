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
  OrderPaymentStatus,
  Source,
  DeliveryStatus,
} from '../enum/en.enum';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import {
  OrderItem,
  OrderItemDocument,
  OrderItemSchema,
} from './order-item.schema';
import { TransactionDocument } from 'src/transaction/schemas/transactions.schema';
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { CustomerDocument } from 'src/customer/schemas/customer.schema';
import { PrinterDocument } from 'src/printer/schema/printer.schema';
import { DriverDocument } from 'src/driver/schema/driver.schema';

export type OrderDocument = Order & Document & SchemaTimestampsConfig;

@Schema({})
class ChefInquiry {
  @Prop()
  comment: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
  })
  userId: UserDocument;
}

export const ChefInquirySchema = SchemaFactory.createForClass(ChefInquiry);

@Schema({ _id: false })
export class Receipts {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Printer',
  })
  printerId: PrinterDocument;

  @Prop({ required: true })
  url: string;
}

export const ReceiptsSchema = SchemaFactory.createForClass(Receipts);

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
    ref: 'Customer',
    default: null,
  })
  customerId: CustomerDocument;

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
    ref: 'User',
    default: null,
  })
  driverId: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
  })
  groupId: string;

  @Prop({ required: true })
  orderNumber: string;

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

  @Prop({ default: null, null: true })
  scheduledDateTime: Date;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItemDocument[];

  @Prop({
    type: String,
    enum: OrderPaymentStatus,
    default: OrderPaymentStatus.NotPaid,
  })
  paymentStatus: OrderPaymentStatus;

  @Prop({ type: String, enum: InvoiceStatus })
  invoiceStatus: InvoiceStatus;

  @Prop({ type: String, enum: DeliveryStatus, default: DeliveryStatus.New })
  deliveryStatus: DeliveryStatus;

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

  @Prop({ default: 0 })
  tip: number;

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
      remainingAmountToCollect: 0,
      taxableFee: 0,
      taxOnFee: 0,
      totalFee: 0,
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
    remainingAmountToCollect: number;
    taxableFee: number;
    taxOnFee: number;
    totalFee: number;
  };

  @Prop()
  taxRate: number;

  @Prop()
  feeRate: number;

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
    default: null,
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

  @Prop({
    type: Object,
    default: null,
  })
  preparationDetails: {
    preparationTime: number;
    expectedStartTime: Date;
    expectedEndTime: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
    kitchenSortingNumber: number;
  };

  @Prop({ type: [ReceiptsSchema], default: [] })
  kitchenReceipts: Receipts[];

  @Prop({ default: false })
  chefRequestedClarification: boolean;

  @Prop({ type: [ChefInquirySchema], default: [] })
  chefInquiry: ChefInquiry[];
}
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.plugin(paginate);
OrderSchema.plugin(mongooseAggregatePaginate);
