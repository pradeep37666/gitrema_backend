import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MaterialItemDto } from './item.dto';
import { Type } from 'class-transformer';

class IdDto {
  @ApiProperty({ required: false })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  _id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  nameAr: string;
}

class VendorRecordDto {
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
  poQuantity: number;

  @ApiProperty({ type: IdDto })
  @ValidateNested({
    message: i18nValidationMessage('validation.MUST_BE_VALID_OBJECT'),
  })
  @Type(() => IdDto)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  uom: IdDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  vendorMaterialId: string;
}

class SinglePoCreateDto {
  @ApiProperty({ type: IdDto })
  @ValidateNested()
  @Type(() => IdDto)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  restaurant: IdDto;

  @ApiProperty({ type: IdDto })
  @ValidateNested()
  @Type(() => IdDto)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  material: IdDto;

  @ApiProperty({ type: IdDto })
  @ValidateNested({
    message: i18nValidationMessage('validation.MUST_BE_VALID_OBJECT'),
  })
  @Type(() => IdDto)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  vendor: IdDto;

  @ApiProperty({ type: VendorRecordDto })
  @ValidateNested({
    message: i18nValidationMessage('validation.MUST_BE_VALID_OBJECT'),
  })
  @Type(() => VendorRecordDto)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  vendorRecord: VendorRecordDto;
}

export class BulkPoCreateDto {
  @ApiProperty({ type: [SinglePoCreateDto] })
  @IsArray({
    message: i18nValidationMessage('validation.MUST_BE_ARRAY'),
  })
  @ValidateNested({ each: true })
  @Type(() => SinglePoCreateDto)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  payload: SinglePoCreateDto[];
}
