import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as bcrypt from 'bcryptjs';
import { SALT_WORK_FACTOR } from 'src/core/Constants/auth.constants';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { RoleDocument } from 'src/role/schemas/roles.schema';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { TableDocument } from 'src/table/schemas/table.schema';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { ListDocument } from 'src/list/schemas/list.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    default: null,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    default: null,
  })
  restaurantId: RestaurantDocument;

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

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'List',
    default: null,
  })
  tableRegion: ListDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'KitchenQueue',
    default: null,
  })
  kitchenQueue: KitchenQueueDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Cashier',
    default: null,
  })
  cashier: CashierDocument;

  @Prop({ default: true })
  isDefaultWaiter: boolean;

  @Prop({ default: false })
  paused: boolean;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
  })
  addedBy: UserDocument;
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
