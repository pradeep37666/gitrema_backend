import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Document,
  Schema as MongooseSchema,
  SchemaTimestampsConfig,
} from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { PermissionActions } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import {
  PermissionSchema,
  PermissionSchemaSchema,
} from 'src/role/schemas/roles.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type FeatureDocument = Feature & Document;

@Schema({ timestamps: true })
export class Feature {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ type: [PermissionSchemaSchema] })
  permissions: PermissionSchema[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  addedBy: UserDocument;
}
export const FeatureSchema = SchemaFactory.createForClass(Feature);
FeatureSchema.plugin(paginate);
