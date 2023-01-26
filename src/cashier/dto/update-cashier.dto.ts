import { PartialType } from '@nestjs/mapped-types';
import { CreateCashierDto } from './create-cashier.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCashierDto extends PartialType(CreateCashierDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
