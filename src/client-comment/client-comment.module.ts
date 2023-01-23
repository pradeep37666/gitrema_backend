import { Module } from '@nestjs/common';
import { ClientCommentService } from './client-comment.service';
import { ClientCommentController } from './client-comment.controller';

@Module({
  controllers: [ClientCommentController],
  providers: [ClientCommentService]
})
export class ClientCommentModule {}
