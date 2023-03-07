import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { CashierDocument } from './cashier.schema';
import { TransactionDocument } from 'src/transaction/schemas/transactions.schema';
import { PausedLog, PausedLogSchema } from './paused-log.schema';
import { OrderDocument } from 'src/order/schemas/order.schema';

export type CashierLogDocument = CashierLog & Document;

@Schema({ timestamps: true })
export class CashierLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Cashier',
    index: true,
    required: true,
  })
  cashierId: CashierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  })
  userId: UserDocument;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ default: null })
  closedAt: Date;

  @Prop({ required: true })
  openingBalance: number;

  @Prop({ required: true })
  currentBalance: number;

  @Prop({ default: null })
  closingBalance: number;

  @Prop({ default: null })
  difference: number;

  @Prop({ default: null })
  overrideReason: string;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Transaction',
    index: true,
    default: [],
  })
  transactions: TransactionDocument[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  })
  overrideBy: UserDocument;

  @Prop({ type: [PausedLogSchema] })
  pausedLogs: PausedLog[];
}

export const CashierLogSchema = SchemaFactory.createForClass(CashierLog);
CashierLogSchema.plugin(paginate);
