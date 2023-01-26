import { Module } from '@nestjs/common';
import { KitchenQueueService } from './kitchen-queue.service';
import { KitchenQueueController } from './kitchen-queue.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KitchenQueue,
  KitchenQueueSchema,
} from './schemas/kitchen-queue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KitchenQueue.name, schema: KitchenQueueSchema },
    ]),
  ],
  controllers: [KitchenQueueController],
  providers: [KitchenQueueService],
})
export class KitchenQueueModule {}
