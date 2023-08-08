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
import { Alergies, MenuSticker, MenuStickerStyle } from '../enum/en.enum';
import { Type } from 'class-transformer';
import { CalculationType } from 'src/core/Constants/enum';

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

class DiscountDto {
  @ApiProperty()
  @IsEnum(CalculationType)
  @IsNotEmpty()
  type: CalculationType;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  value: number;
}

export class HideFromMarketDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty()
  @IsNotEmpty()
  value: boolean;
}

export class SoldOutFromMarketDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty()
  @IsNotEmpty()
  value: boolean;
}

export class PricesForMarketsDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty()
  @IsNotEmpty()
  price: number;
}

export class CreateMenuItemDTO {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId?: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  uomSell?: string;

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
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  descriptionAr?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  taxEnabled?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  priceInStar?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  starGain?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  calories: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  waiterCode?: string;

  @ApiProperty({
    type: [String],
    enum: Alergies,
    enumName: 'Alergies',
    required: false,
  })
  @IsEnum(Alergies, { each: true })
  @IsOptional()
  @IsArray()
  alergies?: Alergies[];

  @ApiProperty({ required: false, type: [QuantityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuantityDto)
  @IsOptional()
  quantities?: QuantityDto[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  suggestedItems?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  additions?: string[];

  @ApiProperty({
    type: String,
    enum: MenuSticker,
    enumName: 'MenuSticker',
    required: false,
  })
  @IsEnum(MenuSticker)
  @IsOptional()
  sticker?: MenuSticker;

  @ApiProperty({
    type: [String],
    enum: MenuStickerStyle,
    enumName: 'MenuStickerStyle',
    required: false,
  })
  @IsArray()
  @IsEnum(MenuStickerStyle, { each: true })
  @IsOptional()
  stickerStyle?: MenuStickerStyle[];

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  hideFromMenu?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  canBuyWithStars?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  soldOut?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  order: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  manageQuantity?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  preparationTime: number;

  importId?: string;


  @ApiProperty({ required: false, type: [HideFromMarketDto] })
  @ValidateNested({ each: true })
  @Type(() => HideFromMarketDto)
  @IsNotEmpty()
  hideFromMarkets?: HideFromMarketDto[];

  @ApiProperty({ required: false, type: [SoldOutFromMarketDto] })
  
  @ValidateNested({ each: true })
  @Type(() => SoldOutFromMarketDto)
  @IsNotEmpty()
  soldOutFromMarkets?: SoldOutFromMarketDto[];

  @ApiProperty({ required: false, type: [PricesForMarketsDto] })
  @ValidateNested({ each: true })
  @Type(() => PricesForMarketsDto)
  @IsNotEmpty()
  pricesForMarkets?: PricesForMarketsDto[];
}



export class UpdateMenuItemDTO extends PartialType(CreateMenuItemDTO) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;

}
