import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus, OrderPaymentStatus, OrderType } from '../enum/en.enum';
import { Transform, Type } from 'class-transformer';
import { ToBoolean } from 'src/core/Helpers/custom.validators';

export class QueryOrderDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  tableId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  customerId: string;

  @ApiProperty({ required: false })
  @ToBoolean()
  @IsOptional()
  notBelongingToTable: boolean;

  @ApiProperty({
    required: false,
    enum: OrderPaymentStatus,
    enumName: 'OrderPaymentStatus',
  })
  @IsEnum(OrderPaymentStatus)
  @IsOptional()
  paymentStatus: OrderPaymentStatus;

  @ApiProperty({
    required: false,
    enum: OrderType,
    enumName: 'OrderType',
  })
  @IsEnum(OrderType)
  @IsOptional()
  orderType: OrderType;

  @ApiProperty({ required: false, type: String, example: 'New,Processing' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.toString().split(','))
  status: OrderStatus[];

  @ApiProperty({ required: false, example: false })
  @ToBoolean()
  @IsOptional()
  chefRequestedClarification: boolean;
}

export class QueryCustomerOrderDto extends QueryOrderDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  supplierId: string;
}
