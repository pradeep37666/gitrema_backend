import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { OrderItemDto } from './order-item.dto';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enum/en.enum';

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
  items?: UpdateOrderItemDto[];

  @ApiProperty({
    type: String,
    enum: OrderStatus,
    required: false,
    enumName: 'OrderStatus',
  })
  @IsEnum(OrderStatus)
  @IsNotIn([OrderStatus.Closed, OrderStatus.Cancelled])
  @IsOptional()
  status?: OrderStatus;

  orderItemIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  chefRequestedClarification?: boolean;

  tip?: number;

  groupId?: string;

  driverId?: string;
}

export class ChangeOrderDto {
  @ApiProperty({ type: [UpdateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  @IsNotEmpty()
  items: UpdateOrderItemDto[];
}

export class TipDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  tip: number;
}
