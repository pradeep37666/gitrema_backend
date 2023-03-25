import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  Schema as MongooseSchema,
  SchemaTimestampsConfig,
} from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { FeatureDocument } from 'src/feature/schemas/feature.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type PackageDocument = Package & Document;

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  days: number;

  @Prop({ default: 0 })
  gracePeriod: number;

  @Prop({ default: 0 })
  trialPeriod: number;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Feature',
    required: true,
  })
  features: FeatureDocument[];

  @Prop({ default: null })
  deliveryMargin: number;

  @Prop({ default: false })
  isDefaultPackage: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  addedBy: UserDocument;
}
export const PackageSchema = SchemaFactory.createForClass(Package);
PackageSchema.plugin(paginate);
