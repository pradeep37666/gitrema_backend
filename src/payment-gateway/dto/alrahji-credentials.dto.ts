import { ApiProperty } from '@nestjs/swagger';
import { PaymentGateways } from '../enum/en';
import { IsEnum, IsMongoId, IsNotEmpty, IsObject } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AlrahjiCredentialsDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  transportalId: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  resourceKey: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  transportalPassword: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  apiUrl: string;
}
