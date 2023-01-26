import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Shape } from '../enum/table.enum';

export class CreateTableDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

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
  @IsNumber()
  totalChairs: number;

  @ApiProperty({ type: String, enum: Shape })
  @IsEnum(Shape)
  @IsNotEmpty()
  shape: Shape;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  minimumOrderValue: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  fees: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  minutesAllowed: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  initialMinutesAllowed: number;
}
