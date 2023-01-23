import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { Shape } from '../enum/table.enum';

export type TableDocument = Table & Document;

@Schema({ timestamps: true })
export class Table {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  name_ar: string;

  @Prop({ required: true })
  totalChairs: number;

  @Prop({ type: String, enum: Shape })
  shape: Shape;

  @Prop({})
  minimumOrderValue: number;

  @Prop({})
  fees: number;

  @Prop({})
  minAllowed: number;

  @Prop({})
  initialMinAllowed: number;
}

export const TableSchema = SchemaFactory.createForClass(Table);
TableSchema.plugin(paginate);
