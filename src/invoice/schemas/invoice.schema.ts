import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'aws-sdk/clients/budgets';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';

import * as uniqid from 'uniqid';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { OrderDocument } from 'src/order/schemas/order.schema';
import { InvoiceType } from '../invoice.enum';
import { UserDocument } from 'src/users/schemas/users.schema';

export type InvoiceDocument = Invoice & Document;

export type ItemDocument = Item & Document;

@Schema({ _id: null })
class Item {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    default: null,
  })
  itemId: ObjectId;

  @Prop({ default: null })
  quantity: number;

  @Prop({ default: null })
  totalWithTax: number;

  @Prop({ default: null })
  taxableAmount: number;

  @Prop({ default: null })
  tax: number;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  nameAr: string;

  @Prop({ default: null })
  additionTextAr: string;
}
const ItemSchema = SchemaFactory.createForClass(Item);

@Schema({ timestamps: true })
export class Invoice {
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
    required: true,
  })
  invoiceNumber: string;

  @Prop({
    required: true,
  })
  orderNumber: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Order',
    index: true,
    required: true,
  })
  orderId: OrderDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Invoice',
    index: true,
    default: null,
  })
  refInvoiceId: InvoiceDocument;

  @Prop({ type: String, enum: InvoiceType })
  type: InvoiceType;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Invoice',
    index: true,
    default: null,
  })
  reversedInvoiceId: InvoiceDocument;

  @Prop({ default: false })
  isReversedInvoice: boolean;

  @Prop({ type: [ItemSchema], default: [] })
  items: ItemDocument[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Invoice',
    index: true,
    default: null,
  })
  refOriginalInvoiceId: InvoiceDocument;

  @Prop({ default: null })
  totalWithTax: number;

  @Prop({ default: null })
  totalTaxable: number;

  @Prop({ default: null })
  totalTax: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  addedBy: UserDocument;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.plugin(paginate);
