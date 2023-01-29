import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { OrderItemDto } from './order-item.dto';
import {
  IsArray,
  IsMongoId,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderItemDto extends OrderItemDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  _id: string;
}
export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['items'] as const),
) {
  @ApiProperty({ type: [UpdateOrderItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsOptional()
  items: UpdateOrderItemDto[];
}
