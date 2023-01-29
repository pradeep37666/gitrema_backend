import { Module } from '@nestjs/common';
import { WaitingQueueService } from './waiting-queue.service';
import { WaitingQueueController } from './waiting-queue.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WaitingQueue,
  WaitingQueueSchema,
} from './schemas/waiting-queue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WaitingQueue.name, schema: WaitingQueueSchema },
    ]),
  ],
  controllers: [WaitingQueueController],
  providers: [WaitingQueueService],
})
export class WaitingQueueModule {}
