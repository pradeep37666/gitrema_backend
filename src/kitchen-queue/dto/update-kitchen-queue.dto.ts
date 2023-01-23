import { PartialType } from '@nestjs/mapped-types';
import { CreateKitchenQueueDto } from './create-kitchen-queue.dto';

export class UpdateKitchenQueueDto extends PartialType(CreateKitchenQueueDto) {}
