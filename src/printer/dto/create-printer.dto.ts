import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PrinterType } from '../enum/en';

export class CreatePrinterDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  @ApiProperty({ required: false })
  nameAr: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  @ApiProperty({ required: false })
  printerLabel: string;

  @ApiProperty({ type: String, enum: PrinterType, enumName: 'PrinterType' })
  @IsEnum(PrinterType, {
    message: i18nValidationMessage('validation.MUST_BE_ENUM'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  type: PrinterType;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsNumber(
    { allowNaN: false },
    {
      message: i18nValidationMessage('validation.MUST_BE_NUMBER'),
    },
  )
  @Max(3)
  @Min(1)
  printerSetup: number;

  @ApiProperty({})
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsBoolean({
    message: i18nValidationMessage('validation.MUST_BE_BOOLEAN'),
  })
  isDefault: boolean;
}
