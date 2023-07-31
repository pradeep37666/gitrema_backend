import { ApiProperty } from '@nestjs/swagger';
import { PaymentGateways } from '../enum/en';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { Type } from 'class-transformer';
import { AlrahjiCredentialsDto } from './alrahji-credentials.dto';
import { ClickpayCredentialsDto } from './clickpay-credentials.dto';

const gatewayList = [AlrahjiCredentialsDto, ClickpayCredentialsDto];

export class CreatePaymentGatewayDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  supplierId: string;

  @ApiProperty({
    type: String,
    enum: PaymentGateways,
    enumName: 'PaymentGateways',
  })
  @IsEnum(PaymentGateways, {
    message: i18nValidationMessage('validation.MUST_BE_ENUM'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  gateway: PaymentGateways;

  @ApiProperty({})
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsObject({
    message: i18nValidationMessage('validation.MUST_BE_OBJECT'),
  })
  @ValidateNested()
  @Type((t) => {
    return gatewayList[PaymentGateways[t.object.gateway]] || null;
  })
  credentials: AlrahjiCredentialsDto | ClickpayCredentialsDto;
}
