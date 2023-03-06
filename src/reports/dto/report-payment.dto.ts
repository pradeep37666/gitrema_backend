import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import * as moment from 'moment';
import { PaymentStatus } from 'src/core/Constants/enum';
import { ShouldBeAfter } from 'src/core/Validators/ShouldBeAfter.validator';
import { ShouldBeBefore } from 'src/core/Validators/ShouldBeBefore.validator';
import { ShouldBeBeforeNow } from 'src/core/Validators/ShouldBeBeforeNow.validator';
import { PaymentMethod } from 'src/payment/enum/en.enum';

export class ReportPaymentDto {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  cashierId: any;

  @ApiProperty({
    required: false,
    type: String,
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({
    required: false,
    type: String,
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

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
