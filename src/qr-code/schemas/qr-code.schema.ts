import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { TableDocument } from 'src/table/schemas/table.schema';
import { UserDocument } from 'src/users/schemas/users.schema';
import { PageType } from '../enum/qr-code.enum';
import * as paginate from 'mongoose-paginate-v2';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';

export type QrCodeDocument = QrCode & Document;

@Schema({ timestamps: true })
export class QrCode {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
    required: true,
  })
  supplierId: SupplierDocument;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Restaurant',
    index: true,
  })
  restaurants: RestaurantDocument[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Table',
    index: true,
  })
  tables: TableDocument[];

  @Prop({ required: true })
  titleAr: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: null })
  subTitleAr: string;

  @Prop({ default: null })
  SubTitle: string;

  @Prop({ default: null })
  footerAr: string;

  @Prop({ default: null })
  footer: string;

  @Prop({ type: String, enum: PageType })
  pageType: PageType;

  @Prop({ default: null })
  backgroundColor: string;

  @Prop({ default: null })
  fontColor: string;

  @Prop({ default: null })
  qrCodeBackgroundColor: string;

  @Prop({ default: null })
  qrCodeColor: string;

  @Prop({ default: true })
  showLogo: boolean;

  @Prop({ default: true })
  active: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    index: true,
    ref: 'User',
  })
  addedBy: UserDocument;
}
export const QrCodeSchema = SchemaFactory.createForClass(QrCode);
QrCodeSchema.plugin(paginate);
