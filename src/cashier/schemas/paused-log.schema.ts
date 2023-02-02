import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class PausedLog {
  @Prop({ required: true })
  reason: string;

  @Prop({ required: true })
  start: Date;

  @Prop({ default: null })
  end?: Date;
}

export const PausedLogSchema = SchemaFactory.createForClass(PausedLog);
