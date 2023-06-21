import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, ObjectId } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { PaymentStatus, PaymentTarget } from 'src/core/Constants/enum';

import { OrderDocument } from 'src/order/schemas/order.schema';
import { PaymentMethod } from 'src/payment/enum/en.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';

export type TransactionDocument = Transaction & Document;

@Schema({ _id: false })
class ExpectedFromPg {
  @Prop({})
  variableBankFee: number;

  @Prop({})
  fixedBankFee: number;

  @Prop({})
  totalBankFee: number;

  @Prop({})
  bankFeeTax: number;

  @Prop({})
  grossBankFee: number;

  @Prop({})
  totalBankSettlement: number;
}

@Schema({ _id: false })
class RagSettlement {
  @Prop({})
  variableFee: number;

  @Prop({})
  fixedFee: number;

  @Prop({})
  totalFee: number;

  @Prop({})
  feeTax: number;

  @Prop({})
  grossFee: number;

  @Prop({})
  totalSettlement: number;

  @Prop({})
  ppfRevenue: number;

  @Prop({})
  paybleTax: number;

  @Prop({})
  netRevenue: number;
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({ default: null })
  uuId: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Order',
    required: true,
  })
  orderId: OrderDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Cashier',
  })
  cashierId: CashierDocument;

  @Prop({ required: true })
  amount: number;

  @Prop({
    required: true,
    index: true,
    type: String,
    enum: PaymentStatus,
    default: PaymentStatus.Pending,
  })
  status: PaymentStatus;

  @Prop({
    index: true,
    type: String,
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Prop()
  paymentGateway: string;

  @Prop({ type: Object, default: null })
  paymentGatewayDetails: object;

  @Prop({})
  externalTransactionId: string;

  @Prop({ type: Object })
  pgResponse: any;

  @Prop({ type: Object })
  expectedFromPg: ExpectedFromPg;

  @Prop({ type: Object })
  actualReceived: any;

  @Prop({ type: Object })
  ragSettlement: RagSettlement;

  @Prop({ default: false })
  isRemitScheduled: boolean;

  @Prop({ default: false })
  isRemitted: boolean;

  @Prop({})
  scheduledPayoutDate: Date;

  @Prop({})
  payoutAmount: number;

  @Prop({ default: false })
  isRefund: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  })
  addedBy: UserDocument;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.plugin(paginate);
TransactionSchema.plugin(mongooseAggregatePaginate);
