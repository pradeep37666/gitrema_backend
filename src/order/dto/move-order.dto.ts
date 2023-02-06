import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class ItemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  itemId: string;
}
export class MoveOrderItemDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  sourceOrderId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  targetOrderId: string;

  @ApiProperty({ type: [ItemDto] })
  @IsArray()
  @Type(() => ItemDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  items: ItemDto[];
}
