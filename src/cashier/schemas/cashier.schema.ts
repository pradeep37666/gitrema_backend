import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import {
  Restaurant,
  RestaurantDocument,
} from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { CashierLogDocument } from './cashier-log.schema';
import { PrinterDocument } from 'src/printer/schema/printer.schema';
import { auditLogPlugin } from 'src/log-payload/plugin/audit-log.plugin';
import { AutoCachePlugin } from 'src/cache/plugin/auto-cache.plugin';

export type CashierDocument = Cashier & Document;

@Schema({ timestamps: true })
export class Cashier {
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
    ref: 'Printer',
    index: true,
  })
  printerId: PrinterDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: false })
  paused: boolean;

  @Prop({ default: true })
  default: boolean;

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'CashierLog',
    index: true,
  })
  currentLog: CashierLogDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const CashierSchema = SchemaFactory.createForClass(Cashier);
CashierSchema.plugin(paginate);
CashierSchema.plugin(AutoCachePlugin);
//CashierSchema.plugin(auditLogPlugin);
