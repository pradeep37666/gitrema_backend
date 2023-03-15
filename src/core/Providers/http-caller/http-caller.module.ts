import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class HttpCallerModule {}
