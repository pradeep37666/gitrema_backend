import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class DiscountOrderDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  couponCode: string;
}
