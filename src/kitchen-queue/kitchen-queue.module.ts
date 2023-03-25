import { Module } from '@nestjs/common';
import { KitchenQueueService } from './kitchen-queue.service';
import { KitchenQueueController } from './kitchen-queue.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KitchenQueue,
  KitchenQueueSchema,
} from './schemas/kitchen-queue.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import {
  KitchenQueueLog,
  KitchenQueueLogSchema,
} from './schemas/kitchen-queue-log.schema';
import { KitchenQueueLogService } from './kitchen-queue-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KitchenQueue.name, schema: KitchenQueueSchema },
      { name: KitchenQueueLog.name, schema: KitchenQueueLogSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [KitchenQueueController],
  providers: [KitchenQueueService, KitchenQueueLogService],
  exports: [KitchenQueueService, KitchenQueueLogService],
})
export class KitchenQueueModule {}
