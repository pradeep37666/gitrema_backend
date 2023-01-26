import { Module } from '@nestjs/common';
import { ClientFeedbackService } from './client-feedback.service';
import { ClientFeedbackController } from './client-feedback.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClientFeedback,
  ClientFeedbackSchema,
} from './schemas/client-feedback.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClientFeedback.name, schema: ClientFeedbackSchema },
    ]),
  ],
  controllers: [ClientFeedbackController],
  providers: [ClientFeedbackService],
})
export class ClientFeedbackModule {}
