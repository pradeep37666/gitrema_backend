import { Module } from '@nestjs/common';
import { ProfitDetailService } from './profit-detail.service';
import { ProfitDetailController } from './profit-detail.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ProfitDetail,
  ProfitDetailSchema,
} from './schema/profit-detail.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProfitDetail.name, schema: ProfitDetailSchema },
    ]),
  ],
  controllers: [ProfitDetailController],
  providers: [ProfitDetailService],
  exports: [ProfitDetailService],
})
export class ProfitDetailModule {}
