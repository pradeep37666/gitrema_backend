import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import {
  PausedLog,
  PausedLogSchema,
} from 'src/cashier/schemas/paused-log.schema';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { KitchenQueueDocument } from './kitchen-queue.schema';

export type KitchenQueueLogDocument = KitchenQueueLog & Document;

@Schema({ timestamps: true })
export class KitchenQueueLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'KitchenQueue',
    index: true,
    required: true,
  })
  kitchenQueueId: KitchenQueueDocument;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ default: null })
  closedAt: Date;

  @Prop({ type: [PausedLogSchema] })
  pausedLogs: PausedLog[];
}

export const KitchenQueueLogSchema =
  SchemaFactory.createForClass(KitchenQueueLog);
KitchenQueueLogSchema.plugin(paginate);
