import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class MarketPlace {
  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  value: boolean;
}

export type MarketPlaceDocument = MarketPlace & Document;
export const MarketPlaceSchema = SchemaFactory.createForClass(MarketPlace);