import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { ListDocument } from 'src/list/schemas/list.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
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
    ref: 'User',
    default: null,
  })
  customerId: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'List',
    default: null,
  })
  tableRegion: ListDocument;

  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  contactNumber: string;

  @Prop()
  date: Date;

  @Prop()
  time: string;

  @Prop({ default: 1 })
  totalMembers: number;

  @Prop({ default: false })
  isCancelled: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  addedBy: UserDocument;
}
export const ReservationSchema = SchemaFactory.createForClass(Reservation);
ReservationSchema.plugin(paginate);
ReservationSchema.plugin(mongooseAggregatePaginate);
