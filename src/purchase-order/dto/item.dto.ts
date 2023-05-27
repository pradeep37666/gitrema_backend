import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import * as moment from 'moment';

export class MaterialItemDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  materialId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  vendorMaterialId?: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @Type()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER'),
    },
  )
  stock: number;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(
    ({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD HH:MM')),
  )
  @IsDate()
  expirationDate?: Date;

  @ApiProperty({})
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uom: string;
}
