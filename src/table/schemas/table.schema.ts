import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');
import { Shape, TableStatus } from '../enum/en.enum';
import { UserDocument } from 'src/users/schemas/users.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { ListDocument } from 'src/list/schemas/list.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { TableLogDocument, TableLogSchema } from './table-log.schema';
import { auditLogPlugin } from 'src/log-payload/plugin/audit-log.plugin';

export type TableDocument = Table & Document;

@Schema({ timestamps: true })
export class Table {
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
    ref: 'List',
    required: true,
  })
  tableRegionId: ListDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ required: true })
  totalChairs: number;

  @Prop({ type: String, enum: Shape })
  shape: Shape;

  @Prop({})
  minimumOrderValue: number;

  @Prop({})
  fees: number;

  @Prop({ default: 60 })
  minutesAllowed: number;

  @Prop({ type: String, enum: TableStatus, default: TableStatus.Empty })
  status: TableStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'TableLog',
    default: null,
  })
  currentTableLog: TableLogDocument;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const TableSchema = SchemaFactory.createForClass(Table);
TableSchema.plugin(mongooseAggregatePaginate);
//TableSchema.plugin(auditLogPlugin);
