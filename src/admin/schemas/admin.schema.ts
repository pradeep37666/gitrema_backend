import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SALT_WORK_FACTOR } from 'src/core/Constants/auth.constants';
import * as paginate from 'mongoose-paginate-v2';
import { RoleDocument } from 'src/role/schemas/roles.schema';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true })
export class Admin {
  @Prop({ default: null })
  name: string;

  @Prop({ unique: true, index: true, sparse: true })
  email: string;

  @Prop()
  password: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Role',
    default: null,
  })
  role: RoleDocument;

  @Prop({ default: null })
  phoneNumber: string;

  @Prop({})
  whatsappNumber: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
  })
  addedBy: AdminDocument;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, SALT_WORK_FACTOR);
    return next();
  } catch (err) {
    return next(err);
  }
});

AdminSchema.plugin(paginate);
