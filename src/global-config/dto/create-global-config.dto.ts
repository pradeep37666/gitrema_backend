import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  DELIVERY_MARGIN,
  PAYOUT_DAY,
} from 'src/core/Constants/financial.constant';

export class CreateGlobalConfigDto {
  @ApiProperty({ required: false, example: DELIVERY_MARGIN })
  @IsNumber()
  @IsOptional()
  deliveryMargin: number;

  @ApiProperty({ required: false, example: PAYOUT_DAY })
  @IsNumber()
  @IsOptional()
  payoutDay: number;
}
