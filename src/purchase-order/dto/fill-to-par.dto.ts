import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MaterialItemDto } from './item.dto';
import { Type } from 'class-transformer';

export class FillToParDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  restaurantId: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  vendorId: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  materialId: string;
}
