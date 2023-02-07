import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import * as moment from 'moment';
import { CalculationType } from 'src/core/Constants/enum';
import { ApplicationType, OfferType } from '../enum/en.enum';

export class CreateOfferDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nameAr: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  start: Date;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  end: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code: string;

  @ApiProperty({ type: String, enum: OfferType })
  @IsNotEmpty()
  @IsEnum(OfferType)
  offerType: OfferType;

  @ApiProperty({ type: String, enum: ApplicationType })
  @IsNotEmpty()
  @IsEnum(ApplicationType)
  applicationType: ApplicationType;

  @ApiProperty({ type: String, enum: CalculationType })
  @IsNotEmpty()
  @IsEnum(CalculationType)
  discountType: CalculationType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxDiscount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxNumberAllowed: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  priority: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  showName: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  menuItemIds: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  menuCategoryIds: string[];
}
