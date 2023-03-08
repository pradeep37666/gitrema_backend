import { CreateCashierDto } from './create-cashier.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCashierDto extends PartialType(CreateCashierDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  default: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  paused: boolean;
}
