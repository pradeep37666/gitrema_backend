import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsMongoId,
  IsOptional,
  isMongoId,
} from 'class-validator';
import * as moment from 'moment';

import { ShouldBeAfter } from 'src/core/Validators/ShouldBeAfter.validator';
import { ShouldBeBefore } from 'src/core/Validators/ShouldBeBefore.validator';
import { ShouldBeBeforeNow } from 'src/core/Validators/ShouldBeBeforeNow.validator';

export class SalesReportDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  restaurantIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @ShouldBeBefore('endDate')
  @Transform(
    ({ value }) =>
      new Date(
        moment
          .utc(value)

          .format('YYYY-MM-DD'),
      ),
  )
  @IsDate()
  startDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @ShouldBeAfter('startDate')
  @Transform(
    ({ value }) =>
      new Date(
        moment
          .utc(value)

          .format('YYYY-MM-DD'),
      ),
  )
  @IsDate()
  endDate: Date;
}

export class SalesTrendReportDailyDto extends OmitType(SalesReportDto, [
  'endDate',
  'startDate',
] as const) {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(
    ({ value }) =>
      new Date(
        moment
          .utc(value)

          .format('YYYY-MM-DD'),
      ),
  )
  @IsDate()
  startDate: Date;
}
