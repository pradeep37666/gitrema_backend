import { Module } from '@nestjs/common';
import { ProfitDetailService } from './profit-detail.service';
import { ProfitDetailController } from './profit-detail.controller';

@Module({
  controllers: [ProfitDetailController],
  providers: [ProfitDetailService]
})
export class ProfitDetailModule {}
