import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Days, OrderTypes } from 'src/core/Constants/enum';
import * as paginate from 'mongoose-paginate-v2';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserDocument } from 'src/users/schemas/users.schema';

export type ScreenDisplayDocument = ScreenDisplay & Document;

@Schema({ timestamps: true })
export class ScreenDisplay {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const ScreenDisplaySchema = SchemaFactory.createForClass(ScreenDisplay);
ScreenDisplaySchema.plugin(paginate);
