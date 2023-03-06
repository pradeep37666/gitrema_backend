import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/order/enum/en.enum';
import { Transform } from 'class-transformer';
import * as moment from 'moment';
import { ShouldBeBeforeNow } from 'src/core/Validators/ShouldBeBeforeNow.validator';
import { ShouldBeBefore } from 'src/core/Validators/ShouldBeBefore.validator';
import { ShouldBeAfter } from 'src/core/Validators/ShouldBeAfter.validator';

export class ReportOrderLifeCycleDto {
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
