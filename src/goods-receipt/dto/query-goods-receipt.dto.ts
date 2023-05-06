import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class QueryGoodsReceiptDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.MUST_BE_STRING'),
  })
  filter: string;
}
