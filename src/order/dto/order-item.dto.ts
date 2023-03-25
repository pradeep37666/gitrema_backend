import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class OptionDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  optionId: string;
}

class MenuAdditionDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  menuAdditionId: string;

  @ApiProperty({ type: [OptionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @IsOptional()
  options: OptionDto[];
}

class MenuItemDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  menuItemId: string;
}
export class OrderItemDto {
  @ApiProperty({ type: MenuItemDto })
  @ValidateNested()
  @Type(() => MenuItemDto)
  @IsNotEmpty()
  menuItem: MenuItemDto;

  @ApiProperty({ type: [MenuAdditionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuAdditionDto)
  @IsOptional()
  additions?: MenuAdditionDto[];

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
