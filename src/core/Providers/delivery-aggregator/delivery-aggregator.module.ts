import { Module } from '@nestjs/common';
import { YallowService } from './yallow.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [YallowService],
  exports: [YallowService],
})
export class DeliveryAggregatorModule {}
