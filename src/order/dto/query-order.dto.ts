import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  OrderStatus,
  OrderPaymentStatus,
  OrderType,
  DeliveryStatus,
} from '../enum/en.enum';
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
  driverId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  customerId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  waiterId: string;

  @ApiProperty({ required: false })
  @ToBoolean()
  @IsOptional()
  notBelongingToTable: boolean;

  @ApiProperty({
    required: false,
    type: String,
    example: 'Pending,Not Paid',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.toString().split(','))
  paymentStatus: OrderPaymentStatus[];

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

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.toString().split(','))
  deliveryStatus: DeliveryStatus[];

  @ApiProperty({ required: false, example: false })
  @ToBoolean()
  @IsOptional()
  chefRequestedClarification: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search: string;
}

export class QueryCustomerOrderDto extends QueryOrderDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  supplierId: string;
}

export class QueryKitchenDisplayDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;
}
