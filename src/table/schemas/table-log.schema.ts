import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { OrderDocument } from 'src/order/schemas/order.schema';

import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { TableDocument } from './table.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { auditLogPlugin } from 'src/log-payload/plugin/audit-log.plugin';

export type TableLogDocument = TableLog & Document;

@Schema({ timestamps: true })
export class TableLog {
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
    ref: 'Table',
    required: true,
  })
  tableId: TableDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
  })
  waiterId: UserDocument;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Order',
    default: [],
  })
  orders: OrderDocument[];

  @Prop({ default: new Date() })
  startingTime: Date;

  @Prop({ default: null })
  closingTime: Date;

  @Prop({ default: null })
  menuScannedTime: Date;

  @Prop({ default: false })
  paymentNeeded: boolean;

  @Prop({ default: false })
  helpNeeded: boolean;

  @Prop({ default: false })
  itemReady: boolean;

  @Prop({ default: false })
  orderReady: boolean;
}

export const TableLogSchema = SchemaFactory.createForClass(TableLog);
TableLogSchema.plugin(paginate);
//TableLogSchema.plugin(auditLogPlugin);
