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
import { PaymentSetupModule } from 'src/payment-setup/payment-setup.module';
import { UserModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { MailModule } from 'src/notification/mail/mail.module';

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
    PaymentSetupModule,
    ListModule,
    UserModule,
    MailModule,
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [TestDataController],
  providers: [TestDataService],
  exports: [TestDataService],
})
export class TestDataModule {}
