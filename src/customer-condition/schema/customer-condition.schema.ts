import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import * as paginate from 'mongoose-paginate-v2';
import { MaterialDocument } from 'src/material/schemas/material.schema';

import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UnitOfMeasureDocument } from 'src/unit-of-measure/schemas/unit-of-measure.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { VendorMaterialDocument } from 'src/vendor-material/schemas/vendor-material.schema';

export type CustomerConditionDocument = CustomerCondition & Document;

@Schema({ timestamps: true })
export class CustomerCondition {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Restaurant',
    index: true,
    required: true,
  })
  restaurantId: RestaurantDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Material',
    index: true,
    default: null,
  })
  materialId: MaterialDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'VendorMaterial',
    index: true,
    required: true,
  })
  vendorMaterialId: VendorMaterialDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  vendorId: SupplierDocument;

  @Prop({ required: true })
  cost: number;

  @Prop({ required: true })
  quantity: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'UnitOfMeasure',
    index: true,
    required: true,
  })
  uom: UnitOfMeasureDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const CustomerConditionSchema =
  SchemaFactory.createForClass(CustomerCondition);

CustomerConditionSchema.plugin(paginate);
