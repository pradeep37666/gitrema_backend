import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { OrderType } from 'src/order/enum/en.enum';
import { Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { ShouldBeBeforeNow } from 'src/core/Validators/ShouldBeBeforeNow.validator';
import { ShouldBeBefore } from 'src/core/Validators/ShouldBeBefore.validator';
import { ShouldBeAfter } from 'src/core/Validators/ShouldBeAfter.validator';

export class ReportOrderKitchenDto {
  @ApiProperty({ type: String, required: true })
  @IsMongoId()
  restaurantId: any;

  // @ApiProperty({
  //   required: false,
  //   type: String,
  //   enum: OrderStatus,
  //   enumName: 'OrderStatus',
  // })
  // @IsOptional()
  // @IsEnum(OrderStatus)
  // status: OrderStatus;
  // pending chef name

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
