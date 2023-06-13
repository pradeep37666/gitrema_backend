import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import {
  OrderStatus,
  OrderPaymentStatus,
  OrderType,
} from 'src/order/enum/en.enum';
import { Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { ShouldBeBeforeNow } from 'src/core/Validators/ShouldBeBeforeNow.validator';
import { ShouldBeBefore } from 'src/core/Validators/ShouldBeBefore.validator';
import { ShouldBeAfter } from 'src/core/Validators/ShouldBeAfter.validator';

export class CostReportDto {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: any;

  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  materialId: any;

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
