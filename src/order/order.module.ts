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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: MenuItem.name, schema: MenuItemSchema },
      { name: MenuAddition.name, schema: MenuAdditionSchema },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderHelperService, CalculationService],
})
export class OrderModule {}
