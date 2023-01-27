import { CreateKitchenQueueDto } from './create-kitchen-queue.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateKitchenQueueDto extends PartialType(CreateKitchenQueueDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  paused: boolean;
}
