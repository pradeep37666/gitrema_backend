import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePackageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  days: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  gracePeriod: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  features: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefaultPackage: boolean;
}
