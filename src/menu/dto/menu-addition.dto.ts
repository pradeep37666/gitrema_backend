import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class AdditionOptionDto {
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
  price: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  calory: number;
}

export class CreateMenuAdditionDTO {
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
  @IsBoolean()
  isMultipleAllowed: boolean;

  @ApiProperty({ type: AdditionOptionDto })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionOptionDto)
  @IsNotEmpty()
  options: AdditionOptionDto[];
}

export class UpdateMenuAdditionDTO extends PartialType(CreateMenuAdditionDTO) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
