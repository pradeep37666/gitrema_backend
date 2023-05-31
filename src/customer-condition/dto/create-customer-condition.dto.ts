import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
export class CreateCustomerConditionDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  supplierId: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  materialId: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  vendorMaterialId?: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER'),
    },
  )
  quantity: number;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER'),
    },
  )
  cost: number;

  @ApiProperty({})
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uom: string;
}
