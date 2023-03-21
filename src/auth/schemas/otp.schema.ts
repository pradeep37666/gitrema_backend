import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OtpStatus } from 'src/core/Constants/enum';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ default: null })
  email: string;

  @Prop({ default: null })
  phoneNumber: string;

  @Prop({ required: true })
  code: number;

  @Prop({ type: String, default: OtpStatus.Pending, enum: OtpStatus })
  status: OtpStatus;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
