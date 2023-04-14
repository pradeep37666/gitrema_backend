import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './create-notification.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
