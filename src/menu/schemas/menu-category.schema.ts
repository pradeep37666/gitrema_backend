import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import * as paginate from 'mongoose-paginate-v2';
import { AutoCachePlugin } from 'src/cache/plugin/auto-cache.plugin';
import { ImportDocument } from 'src/import/schemas/import.schema';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { PrinterDocument } from 'src/printer/schema/printer.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { UserDocument } from 'src/users/schemas/users.schema';

export type MenuCategoryDocument = MenuCategory & Document;

@Schema({ timestamps: true })
export class MenuCategory {
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

  @Prop({ default: null })
  image: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Printer',
    index: true,
  })
  printerId: PrinterDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'KitchenQueue',
    index: true,
  })
  kitchenQueueId: KitchenQueueDocument;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'Import',
  })
  importId: ImportDocument;
}

export const MenuCategorySchema = SchemaFactory.createForClass(MenuCategory);
MenuCategorySchema.plugin(paginate);
MenuCategorySchema.plugin(AutoCachePlugin);
