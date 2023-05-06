import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { MaterialType, ProcurementType, UnitOfMeasure } from '../enum/en';

export class CreateMaterialDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  name: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  nameAr: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  descriptionAr: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uomSell: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uomBuy: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uomRecipe: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray({
    message: i18nValidationMessage('validation.MUST_BE_ARRAY'),
  })
  @IsMongoId({
    each: true,
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uomInventory: string[];

  @ApiProperty({})
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  uomBase: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean({
    message: i18nValidationMessage('validation.MUST_BE_BOOLEAN'),
  })
  isQuantityManaged?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  menuItemId: string;

  @ApiProperty({ type: String, enum: MaterialType, enumName: 'MaterialType' })
  @IsEnum(MaterialType, {
    message: i18nValidationMessage('validation.MUST_BE_ENUM'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  materialType: MaterialType;

  @ApiProperty({
    type: String,
    enum: ProcurementType,
    enumName: 'ProcurementType',
  })
  @IsEnum(ProcurementType, {
    message: i18nValidationMessage('validation.MUST_BE_ENUM'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  procurementType: ProcurementType;
}
