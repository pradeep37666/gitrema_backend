import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateMenuCategoryDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nameAr: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  order: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  printerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  kitchenQueueId?: string;
}

export class UpdateMenuCategoryDTO extends PartialType(CreateMenuCategoryDTO) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
