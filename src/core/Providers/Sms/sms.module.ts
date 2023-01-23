import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AsmscService } from './asmsc-sms.service';

@Module({
  imports: [HttpModule],
  providers: [AsmscService],
  controllers: [],
  exports: [AsmscService],
})
export class SmsModule {}
