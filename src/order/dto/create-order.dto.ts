import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { OrderType, Source } from '../enum/en.enum';
import { Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { OrderItemDto } from './order-item.dto';
import { LocationDto } from 'src/restaurant/dto/create-restaurant.dto';

class DeliveryAddressDto extends OmitType(LocationDto, ['country'] as const) {}

export class CreateOrderDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.orderType == OrderType.DineIn)
  @IsMongoId()
  @IsNotEmpty()
  tableId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  waiterId?: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  kitchenQueueId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactNumber?: string;

  @ApiProperty({ type: String, enum: Source, enumName: 'Source' })
  @IsEnum(Source)
  @IsNotEmpty()
  source: Source;

  @ApiProperty({ type: String, enum: OrderType, enumName: 'OrderType' })
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items: OrderItemDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean;

  @ApiProperty({ required: false })
  @ValidateIf((o) => o.isScheduled)
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  @MinDate(new Date(), {
    message:
      'minimal allowed date for scheduledDate is ' + new Date().toISOString(),
  })
  scheduledDateTime?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(
    ({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD HH:MM')),
  )
  @IsDate()
  menuQrCodeScannedTime?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiProperty({ required: false, type: DeliveryAddressDto })
  @ValidateIf((o) => o.orderType == OrderType.Delivery)
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  @IsNotEmpty()
  deliveryAddress?: DeliveryAddressDto;
}
