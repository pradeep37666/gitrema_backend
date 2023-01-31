import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';

import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

export type TableDocument = TableLog & Document;

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

  @Prop({ default: null })
  startingTime: Date;

  @Prop({ default: null })
  closingTime: Date;
}

export const TableLogSchema = SchemaFactory.createForClass(TableLog);
TableLogSchema.plugin(paginate);
