import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AsmscService } from './asmsc-sms.service';
import { TaqnyatService } from './taqnyat.service';

@Module({
  imports: [HttpModule],
  providers: [AsmscService, TaqnyatService],
  controllers: [],
  exports: [AsmscService, TaqnyatService],
})
export class SmsModule {}
