import { Module } from '@nestjs/common';
import { TestDataService } from './test-data.service';
import { TestDataController } from './test-data.controller';

import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { TableModule } from 'src/table/table.module';
import { CashierModule } from 'src/cashier/cashier.module';
import { KitchenQueueModule } from 'src/kitchen-queue/kitchen-queue.module';
import { OrderModule } from 'src/order/order.module';
import { MenuModule } from 'src/menu/menu.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { PaymentModule } from 'src/payment/payment.module';
import { ListModule } from 'src/list/list.module';

@Module({
  imports: [
    RestaurantModule,
    TableModule,
    CashierModule,
    KitchenQueueModule,
    OrderModule,
    MenuModule,
    InvoiceModule,
    PaymentModule,
    ListModule,
  ],
  controllers: [TestDataController],
  providers: [TestDataService],
  exports: [TestDataService],
})
export class TestDataModule {}
