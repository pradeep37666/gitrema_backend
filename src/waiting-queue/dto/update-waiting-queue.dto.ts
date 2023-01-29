import { PartialType } from '@nestjs/swagger';
import { CreateWaitingQueueDto } from './create-waiting-queue.dto';

export class UpdateWaitingQueueDto extends PartialType(CreateWaitingQueueDto) {}
