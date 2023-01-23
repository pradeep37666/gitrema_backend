import { Module } from '@nestjs/common';
import { ClientFeedbackService } from './client-feedback.service';
import { ClientFeedbackController } from './client-feedback.controller';

@Module({
  controllers: [ClientFeedbackController],
  providers: [ClientFeedbackService]
})
export class ClientFeedbackModule {}
