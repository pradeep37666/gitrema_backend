import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import * as moment from 'moment';
import { ToBoolean } from 'src/core/Helpers/custom.validators';

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

export class QueryCashierDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ToBoolean()
  includeOrders?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ToBoolean()
  activeCashiers?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @ToBoolean()
  nonActiveCashiers?: boolean;
}

export class ExpenseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expenseNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  attachment: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  expense: number;
}
