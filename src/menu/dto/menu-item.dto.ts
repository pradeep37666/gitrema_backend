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
} from 'class-validator';
import { Alergies, MenuSticker, MenuStickerStyle } from '../enum/menu.enum';

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
  description_ar: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

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

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  waiterCode: string;

  @ApiProperty({ type: [String], enum: Alergies, required: false })
  @IsEnum(Alergies, { each: true })
  @IsOptional()
  @IsArray()
  alergies: Alergies[];

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  quantity: number;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  hideFromMenu: boolean;

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
