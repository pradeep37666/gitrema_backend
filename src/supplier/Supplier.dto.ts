import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsDate,
  IsOptional,
  IsObject,
  IsMongoId,
  IsArray,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class AddSupplierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nameAr: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  about: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aboutAr: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vatNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  twitter: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instagram: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  snapchat: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tiktok: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  whatsapp: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logo: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  backgroundImage: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  domain: string;
}

export class UpdateSupplierDto extends PartialType(AddSupplierDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active: boolean;
}

export class SupplierQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email: string;
}
