import { PartialType } from '@nestjs/mapped-types';
import { CreateClientCommentDto } from './create-client-comment.dto';

export class UpdateClientCommentDto extends PartialType(CreateClientCommentDto) {}
