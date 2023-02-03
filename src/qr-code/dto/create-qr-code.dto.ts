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
import { PageType } from '../enum/en.enum';

export class CreateQrCodeDto {
  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  restaurants: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  tables: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  titleAr: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subTitle: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subTitleAr: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  footer: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  footerAr: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  backgroundColor: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fontColor: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  qrCodeBackgroundColor: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  qrCodeColor: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showLogo: boolean;

  @ApiProperty({ type: String, enum: PageType, enumName: 'PageType' })
  @IsEnum(PageType)
  @IsNotEmpty()
  pageType: PageType;
}
