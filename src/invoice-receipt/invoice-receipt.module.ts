import { Module } from '@nestjs/common';
import { InvoiceReceiptService } from './invoice-receipt.service';
import { InvoiceReceiptController } from './invoice-receipt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GoodsReceipt,
  GoodsReceiptSchema,
} from 'src/goods-receipt/schemas/goods-receipt.schema';
import {
  InvoiceReceipt,
  InvoiceReceiptSchema,
} from './schema/invoice-receipt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoodsReceipt.name, schema: GoodsReceiptSchema },
      { name: InvoiceReceipt.name, schema: InvoiceReceiptSchema },
    ]),
  ],
  controllers: [InvoiceReceiptController],
  providers: [InvoiceReceiptService],
})
export class InvoiceReceiptModule {}
