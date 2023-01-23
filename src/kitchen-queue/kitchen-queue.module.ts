import { Module } from '@nestjs/common';
import { KitchenQueueService } from './kitchen-queue.service';
import { KitchenQueueController } from './kitchen-queue.controller';

@Module({
  controllers: [KitchenQueueController],
  providers: [KitchenQueueService]
})
export class KitchenQueueModule {}
