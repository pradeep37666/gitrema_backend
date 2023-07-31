import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { CashierDocument } from './cashier.schema';
import { TransactionDocument } from 'src/transaction/schemas/transactions.schema';
import { PausedLog, PausedLogSchema } from './paused-log.schema';
import { OrderDocument } from 'src/order/schemas/order.schema';
import { auditLogPlugin } from 'src/log-payload/plugin/audit-log.plugin';

export type CashierLogDocument = CashierLog & Document;

@Schema({ timestamps: true })
class Expense {
  @Prop({ required: true })
  description: string;

  @Prop({ default: null })
  expenseNumber: string;

  @Prop({ default: null })
  attachment: string;

  @Prop({ required: true })
  expense: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  })
  addedBy: UserDocument;
}
const ExpenseSchema = SchemaFactory.createForClass(Expense);

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

  @Prop({ default: [], type: [String] })
  images: string[];

  @Prop({ default: [], type: [String] })
  notes: string[];

  @Prop({ type: [PausedLogSchema] })
  pausedLogs: PausedLog[];

  @Prop({ type: [ExpenseSchema] })
  expenses: Expense[];
}

export const CashierLogSchema = SchemaFactory.createForClass(CashierLog);
CashierLogSchema.plugin(paginate);
CashierLogSchema.plugin(auditLogPlugin);
