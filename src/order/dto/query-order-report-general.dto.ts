import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import {
  OrderStatus,
  PaymentStatus as OrderPaymentStatus,
  OrderType,
} from '../enum/en.enum';
import { Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { ShouldBeBeforeNow } from 'src/core/Validators/ShouldBeBeforeNow.validator';
import { ShouldBeBefore } from 'src/core/Validators/ShouldBeBefore.validator';
import { ShouldBeAfter } from 'src/core/Validators/ShouldBeAfter.validator';

export class QueryOrderReportGeneralDto {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: any;

  @ApiProperty({
    required: false,
    type: String,
    enum: OrderStatus,
    enumName: 'OrderStatus',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({
    required: false,
    type: String,
    enum: OrderPaymentStatus,
    enumName: 'OrderPaymentStatus',
  })
  @IsOptional()
  @IsEnum(OrderPaymentStatus)
  paymentStatus: OrderPaymentStatus;

  @ApiProperty({
    required: false,
    type: String,
    enum: OrderType,
    enumName: 'OrderType',
  })
  @IsEnum(OrderType)
  @IsOptional()
  orderType: OrderType;

  @ApiProperty({ required: false })
  @IsOptional()
  @ShouldBeAfter('endDate')
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  startDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @ShouldBeBeforeNow()
  @ShouldBeBefore('startDate')
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  endDate: Date;
}
