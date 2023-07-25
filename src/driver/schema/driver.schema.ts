import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true })
export class Driver {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    default: null,
  })
  supplierId: SupplierDocument;

  @Prop({ default: null })
  name: string;

  @Prop({ unique: true, index: true, sparse: true })
  email: string;

  @Prop({ default: null })
  phoneNumber: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    default: null,
  })
  addedBy: UserDocument;
}
export const DriverSchema = SchemaFactory.createForClass(Driver);
DriverSchema.plugin(paginate);
