import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
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
import { PaymentGateways } from 'src/payment-gateway/enum/en';

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

  @ApiProperty({
    required: false,
    type: String,
    enum: PaymentGateways,
    enumName: 'PaymentGateways',
  })
  @IsEnum(PaymentGateways)
  @IsOptional()
  paymentGateway?: PaymentGateways;

  lastLowInventoryNotificationSentAt?: Date;
}
