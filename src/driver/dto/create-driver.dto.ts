import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateDriverDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  @ApiProperty({ required: false })
  email?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
