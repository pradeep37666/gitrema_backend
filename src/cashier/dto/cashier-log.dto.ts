import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class OpenCashierDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cashierId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  openingBalance: number;
}

export class CloseCashierDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cashierId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  closingBalance: number;
}

export class OverrideCloseCashierDto extends CloseCashierDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  overrideReason: string;
}
