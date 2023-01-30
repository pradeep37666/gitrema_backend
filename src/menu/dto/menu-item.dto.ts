import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Alergies, MenuSticker, MenuStickerStyle } from '../enum/menu.enum';
import { Type } from 'class-transformer';

class QuantityDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;
}

export class CreateMenuItemDTO {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nameAr: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descriptionAr: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taxEnabled: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  priceInStar: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  starGain: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  calories: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  waiterCode: string;

  @ApiProperty({ type: [String], enum: Alergies, required: false })
  @IsEnum(Alergies, { each: true })
  @IsOptional()
  @IsArray()
  alergies: Alergies[];

  @ApiProperty({ required: false, type: [QuantityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuantityDto)
  @IsOptional()
  quantities: QuantityDto[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  suggestedItems: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  additions: string[];

  @ApiProperty({ type: String, enum: MenuSticker, required: false })
  @IsEnum(MenuSticker)
  @IsOptional()
  sticker: MenuSticker;

  @ApiProperty({ type: [String], enum: MenuStickerStyle, required: false })
  @IsArray()
  @IsEnum(MenuStickerStyle, { each: true })
  @IsOptional()
  stickerStyle: MenuStickerStyle[];

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  image: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  hideFromMenu: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  canBuyWithStars: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  soldOut: boolean;
}

export class UpdateMenuItemDTO extends PartialType(CreateMenuItemDTO) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
