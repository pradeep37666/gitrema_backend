import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { Shape } from '../enum/table.enum';
import { UserDocument } from 'src/users/schemas/users.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { ListDocument } from 'src/list/schemas/list.schema';

export type TableDocument = Table & Document;

@Schema({ timestamps: true })
export class Table {
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

  @Prop({})
  minutesAllowed: number;

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
TableSchema.plugin(paginate);
