import { Module } from '@nestjs/common';
import { PublishService } from './publish.service';
import { PublishController } from './publish.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/restaurant/schemas/restaurant.schema';
import {
  MenuCategory,
  MenuCategorySchema,
} from 'src/menu/schemas/menu-category.schema';
import {
  MenuAddition,
  MenuAdditionSchema,
} from 'src/menu/schemas/menu-addition.schema';
import { MenuItem, MenuItemSchema } from 'src/menu/schemas/menu-item.schema';
import { Role, RoleSchema } from 'src/role/schemas/roles.schema';
import { HttpModule } from '@nestjs/axios';
import { Cashier, CashierSchema } from 'src/cashier/schemas/cashier.schema';
import { Printer, PrinterSchema } from 'src/printer/schema/printer.schema';
import { Table, TableSchema } from 'src/table/schemas/table.schema';
import {
  KitchenQueue,
  KitchenQueueSchema,
} from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { List, ListSchema } from 'src/list/schemas/list.schema';
import {
  PaymentGateway,
  PaymentGatewaySchema,
} from 'src/payment-gateway/schema/payment-gateway.schema';
import {
  PaymentSetup,
  PaymentSetupSchema,
} from 'src/payment-setup/schemas/payment-setup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: User.name, schema: UserSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
      { name: MenuAddition.name, schema: MenuAdditionSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: Cashier.name, schema: CashierSchema },
      { name: Printer.name, schema: PrinterSchema },
      { name: Table.name, schema: TableSchema },
      { name: KitchenQueue.name, schema: KitchenQueueSchema },
      { name: List.name, schema: ListSchema },
      { name: PaymentGateway.name, schema: PaymentGatewaySchema },
      { name: PaymentSetup.name, schema: PaymentSetupSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    HttpModule,
  ],
  controllers: [PublishController],
  providers: [PublishService],
})
export class PublishModule {}
