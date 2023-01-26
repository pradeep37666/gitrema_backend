import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type MenuAdditionDocument = MenuAddition & Document;

@Schema({ _id: false })
class AdditionOption {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ required: true })
  price: number;

  @Prop({})
  order: number;

  @Prop({})
  calory: number;

  @Prop({ default: true })
  active: boolean;
}
const AdditionOptionSchema = SchemaFactory.createForClass(AdditionOption);

@Schema({ timestamps: true })
export class MenuAddition {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: false })
  isMultipleAllowed: boolean;

  @Prop({ type: [AdditionOptionSchema] })
  options: AdditionOption[];

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const MenuAdditionSchema = SchemaFactory.createForClass(MenuAddition);
MenuAdditionSchema.plugin(paginate);
