import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

class ManualCountDto {
  @ApiProperty({ example: 1 })
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
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uom: string;
}

export class CreateInventoryCountDto {
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
  materialId: string;

  @ApiProperty({ type: [ManualCountDto] })
  @IsArray({
    message: i18nValidationMessage('validation.MUST_BE_ARRAY'),
  })
  @ValidateNested({ each: true })
  @Type(() => ManualCountDto)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  count: ManualCountDto[];
}
