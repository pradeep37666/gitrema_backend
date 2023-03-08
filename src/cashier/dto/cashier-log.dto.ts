import { OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import * as moment from 'moment';

export class OpenCashierDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  cashierId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  openingBalance: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image: string;
}

export class CloseCashierDto extends OmitType(OpenCashierDto, [
  'openingBalance',
] as const) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  closingBalance: number;

  overrideReason?: string;
}

export class OverrideCloseCashierDto extends CloseCashierDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  overrideReason: string;
}

export class QueryCashierLogDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  createdAt: Date;
}
