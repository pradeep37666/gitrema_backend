import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import {
  DELIVERY_MARGIN,
  PAYOUT_DAY,
} from 'src/core/Constants/system.constant';

export class CreateGlobalConfigDto {
  @ApiProperty({ required: false, example: DELIVERY_MARGIN })
  @IsNumber()
  @IsOptional()
  deliveryMargin?: number;

  @ApiProperty({ required: false, example: PAYOUT_DAY })
  @IsNumber()
  @IsOptional()
  payoutDay?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  lowInventoryNotificationTime?: string;

  lastLowInventoryNotificationSentAt?: Date;
}
