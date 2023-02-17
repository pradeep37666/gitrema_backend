import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate,
  ValidateNested,
} from 'class-validator';
import { ActivitySubject, ActivityType } from '../enum/activity.enum';
import { Transform, Type } from 'class-transformer';
import * as moment from 'moment';
import { OrderActivityType } from 'src/order/enum/en.enum';

export class CreateActivityDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  dataId: string;

  @ApiProperty({
    type: String,
    enum: ActivitySubject,
    enumName: 'ActivitySubject',
  })
  @IsEnum(ActivitySubject)
  @IsNotEmpty()
  subject: ActivitySubject;

  @ApiProperty({ type: String, enum: ActivityType, enumName: 'ActivityType' })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  type: ActivityType;

  @ApiProperty({ type: Object })
  @IsNotEmpty()
  data: any;
}
