import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as bcrypt from 'bcryptjs';
import { SALT_WORK_FACTOR } from 'src/core/Constants/auth.constants';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { RoleDocument } from 'src/role/schemas/roles.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    default: null,
  })
  supplierId: SupplierDocument;

  @Prop({})
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

  @Prop()
  accessToken: string;

  @Prop({ default: null })
  phoneNumber: string;

  @Prop({})
  whatsappNumber: string;

  @Prop({
    type: Object,
    default: {},
  })
  address: {
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Prop({ default: null })
  profileImage: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
  })
  addedBy: User;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, SALT_WORK_FACTOR);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.plugin(paginate);
