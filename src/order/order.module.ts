import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuItem, MenuItemSchema } from 'src/menu/schemas/menu-item.schema';
import {
  MenuAddition,
  MenuAdditionSchema,
} from 'src/menu/schemas/menu-addition.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { OrderHelperService } from './order-helper.service';
import { CalculationService } from './calculation.service';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';
import { Table, TableSchema } from 'src/table/schemas/table.schema';
import { Offer, OfferSchema } from 'src/offer/schemas/offer.schema';
import { Activity, ActivitySchema } from 'src/activity/schemas/activity.schema';
import { TableLog, TableLogSchema } from 'src/table/schemas/table-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Supplier.name, schema: SupplierSchema },
      { name: Table.name, schema: TableSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuAddition.name, schema: MenuAdditionSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: TableLog.name, schema: TableLogSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderHelperService, CalculationService],
  exports: [OrderService, OrderHelperService, CalculationService],
})
export class OrderModule {}
