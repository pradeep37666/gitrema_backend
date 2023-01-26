import {
  IsEmail,
  IsNumber,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddSupplierDto } from 'src/supplier/Supplier.dto';

export class SignupRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @Type(() => AddSupplierDto)
  @ValidateNested()
  supplier: AddSupplierDto;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  whatsappNumber: string;
}
