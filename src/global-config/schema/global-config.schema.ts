import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

export type GlobalConfigDocument = GlobalConfig & Document;

@Schema({ timestamps: true })
export class GlobalConfig {
  @Prop({})
  deliveryMargin: number;
}
export const GlobalConfigSchema = SchemaFactory.createForClass(GlobalConfig);
GlobalConfigSchema.plugin(paginate);
