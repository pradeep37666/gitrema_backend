import { Module, CacheModule as BaseCacheModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CacheService } from './cache.service';
import * as redisStore from 'cache-manager-redis-store';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';
import {
  MenuCategory,
  MenuCategorySchema,
} from 'src/menu/schemas/menu-category.schema';
import { CacheDataService } from './cache-data.service';
import { CacheController } from './cache.controller';
import {
  MenuAddition,
  MenuAdditionSchema,
} from 'src/menu/schemas/menu-addition.schema';
import {
  Restaurant,
  RestaurantSchema,
} from 'src/restaurant/schemas/restaurant.schema';
import {
  KitchenQueue,
  KitchenQueueSchema,
} from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { Table, TableSchema } from 'src/table/schemas/table.schema';

@Module({
  imports: [
    BaseCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('aws.AWS_REDIS_HOST'),
        port: configService.get('aws.process.env.AWS_REDIS_PORT'),
        ttl: 0,
        isGlobal: true,
      }),
    }),
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
      { name: MenuCategory.name, schema: MenuCategorySchema },
      { name: MenuAddition.name, schema: MenuAdditionSchema },
      { name: Restaurant.name, schema: RestaurantSchema },
      { name: KitchenQueue.name, schema: KitchenQueueSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Table.name, schema: TableSchema },
    ]),
  ],
  controllers: [CacheController],
  providers: [CacheService, CacheDataService],
  exports: [CacheService],
})
export class CacheModule {}
