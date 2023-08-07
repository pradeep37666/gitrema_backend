import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { AutoCachePlugin } from 'src/cache/plugin/auto-cache.plugin';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

import { UserDocument } from 'src/users/schemas/users.schema';

export type KitchenQueueDocument = KitchenQueue & Document;

@Schema({ timestamps: true })
export class KitchenQueue {
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

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nameAr: string;

  @Prop({ default: false })
  paused: boolean;

  @Prop({ default: true })
  default: boolean;

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}

export const KitchenQueueSchema = SchemaFactory.createForClass(KitchenQueue);
KitchenQueueSchema.plugin(paginate);
KitchenQueueSchema.plugin(AutoCachePlugin);
