import { Module } from '@nestjs/common';
import { GoodsReceiptService } from './goods-receipt.service';
import { GoodsReceiptController } from './goods-receipt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GoodsReceipt,
  GoodsReceiptSchema,
} from './schemas/goods-receipt.schema';
import { InventoryModule } from 'src/inventory/inventory.module';
import { GoodsReceiptHelperService } from './goods-receipt-helper.service';
import {
  PurchaseOrder,
  PurchaseOrderSchema,
} from 'src/purchase-order/schemas/purchase-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GoodsReceipt.name, schema: GoodsReceiptSchema },
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema },
    ]),
    InventoryModule,
  ],
  controllers: [GoodsReceiptController],
  providers: [GoodsReceiptService, GoodsReceiptHelperService],
})
export class GoodsReceiptModule {}
