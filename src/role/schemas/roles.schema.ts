import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { RoleSlug } from 'src/core/Constants/enum';
import { PermissionActions } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { ScreenDisplayDocument } from 'src/screen-display/schemas/screen-display.schema';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type RoleDocument = Role & Document;

@Schema({ _id: false })
export class PermissionSchema {
  @Prop({ type: String, enum: PermissionSubject })
  subject: PermissionSubject;

  @Prop({ type: [String], enum: PermissionActions })
  permissions: PermissionActions[];
}
export const PermissionSchemaSchema =
  SchemaFactory.createForClass(PermissionSchema);

@Schema({ timestamps: true })
export class Role {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    default: null,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [PermissionSchemaSchema] })
  permissions: PermissionSchema[];

  @Prop({ type: [String] })
  events: SocketEvents[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'ScreenDisplay',
    default: [],
  })
  screenDisplays: ScreenDisplayDocument[];

  @Prop({ type: String, enum: RoleSlug })
  slug: RoleSlug;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  addedBy: UserDocument;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.plugin(paginate);
