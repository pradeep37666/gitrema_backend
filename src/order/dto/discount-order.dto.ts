import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CalculationType } from 'src/core/Constants/enum';

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
export class AdhocDiscountDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    type: String,
    enum: CalculationType,
    enumName: 'CalculationType',
  })
  @IsNotEmpty()
  @IsEnum(CalculationType)
  discountType: CalculationType;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  discount: number;
}
