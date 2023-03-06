import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';

import { UserDocument } from 'src/users/schemas/users.schema';

export type ImportDocument = Import & Document;

@Schema({ timestamps: true })
export class Import {
  @Prop({ default: null })
  url: string;

  @Prop({ type: [], default: [] })
  importRes: any[];

  @Prop({ default: 'pending' })
  status: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  addedBy: UserDocument;
}
export const ImportSchema = SchemaFactory.createForClass(Import);
ImportSchema.plugin(paginate);
