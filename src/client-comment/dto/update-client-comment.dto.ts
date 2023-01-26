import { PartialType } from '@nestjs/swagger';
import { CreateClientCommentDto } from './create-client-comment.dto';

export class UpdateClientCommentDto extends PartialType(
  CreateClientCommentDto,
) {}
