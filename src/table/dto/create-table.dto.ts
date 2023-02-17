import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Shape } from '../enum/en.enum';

export class CreateTableDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  tableRegionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nameAr: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  totalChairs?: number;

  @ApiProperty({
    type: String,
    enum: Shape,
    enumName: 'Shape',
    required: false,
  })
  @IsEnum(Shape)
  @IsOptional()
  shape?: Shape;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumOrderValue?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  fees?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minutesAllowed?: number;
}
