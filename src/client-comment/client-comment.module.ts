import { Module } from '@nestjs/common';
import { ClientCommentService } from './client-comment.service';
import { ClientCommentController } from './client-comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ClientComment,
  ClientCommentSchema,
} from './schemas/client-comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClientComment.name, schema: ClientCommentSchema },
    ]),
  ],
  controllers: [ClientCommentController],
  providers: [ClientCommentService],
})
export class ClientCommentModule {}
