import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taxEnabled: boolean;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxOptions: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  minOptions: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  freeOptions: number;

  @ApiProperty({ type: [AdditionOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionOptionDto)
  @IsNotEmpty()
  options: AdditionOptionDto[];
}

class UpdateAdditionOptionDto extends AdditionOptionDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  _id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
export class UpdateMenuAdditionDTO extends PartialType(
  OmitType(CreateMenuAdditionDTO, ['options'] as const),
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;

  @ApiProperty({ type: [UpdateAdditionOptionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAdditionOptionDto)
  @IsOptional()
  options: UpdateAdditionOptionDto[];
}
