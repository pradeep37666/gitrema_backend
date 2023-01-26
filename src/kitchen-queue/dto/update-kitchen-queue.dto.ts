import { PartialType } from '@nestjs/mapped-types';
import { CreateKitchenQueueDto } from './create-kitchen-queue.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateKitchenQueueDto extends PartialType(CreateKitchenQueueDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
