import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import * as moment from 'moment';

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

  @ApiProperty()
  @IsOptional()
  overrideReason?: string;

  @ApiProperty()
  @IsOptional()
  overridenBalance?: number;

  @ApiProperty()
  @IsOptional()
  images?: string[];
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

  @ApiProperty()
  @IsOptional()
  closingNote?: string;

  @ApiProperty()
  @IsOptional()
  images?: string[];
}

// export class OverrideCloseCashierDto extends CloseCashierDto {
//   @ApiProperty()
//   @IsNotEmpty()
//   @IsString()
//   overrideReason: string;
// }

export class QueryCashierLogDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  createdAt: Date;
}
