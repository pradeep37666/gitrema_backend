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

class PauseActivityDto {
  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  reason: string;

  @IsNotEmpty()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  @MinDate(new Date(moment.utc().format('YYYY-MM-DD')), {
    message: 'minimal allowed date for start is ' + new Date().toDateString(),
  })
  @ApiProperty({ type: String })
  start: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  @MinDate(new Date(moment.utc().format('YYYY-MM-DD')), {
    message: 'minimal allowed date for start is ' + new Date().toDateString(),
  })
  @ApiProperty({ type: String, required: false })
  end: Date;
}
export class CreateActivityDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  dataId: string;

  @ApiProperty({ type: String, enum: ActivitySubject })
  @IsEnum(ActivitySubject)
  @IsNotEmpty()
  subject: ActivitySubject;

  @ApiProperty({ type: String, enum: ActivityType })
  @IsEnum(ActivityType)
  @IsNotEmpty()
  type: ActivityType;

  @ApiProperty({ type: PauseActivityDto })
  @ValidateNested({ each: true })
  @Type(() => PauseActivityDto)
  @IsNotEmpty()
  data: PauseActivityDto;
}
