import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose, { ObjectId } from 'mongoose';
import { TableStatus } from '../enum/en.enum';
import { OrderPaymentStatus, OrderStatus } from 'src/order/enum/en.enum';

export class QueryTableDto {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: any;

  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  tableRegionId: any;

  @ApiProperty({
    required: false,
    type: String,
    enum: TableStatus,
    enumName: 'TableStatus',
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status: TableStatus[];
}

export class QueryReadyToServeItemsDto {
  @ApiProperty({ type: String, required: true })
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: any;

  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  tableId: any;
}

export class QuerySingleTableDto {
  @ApiProperty({
    type: OrderPaymentStatus,
    required: false,
    enum: OrderPaymentStatus,
  })
  @IsEnum(OrderPaymentStatus)
  @IsOptional()
  paymentStatus: OrderPaymentStatus;

  @ApiProperty({
    type: OrderStatus,
    required: false,
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status: OrderStatus;
}
