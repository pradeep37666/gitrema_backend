import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import * as moment from 'moment';
import { Transform } from 'class-transformer';

export class TableLogDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(
    ({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD HH:MM')),
  )
  @IsDate()
  menuScannedTime?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  helpNeeded?: boolean;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  waiterId?: string;

  itemReady?: boolean;

  orderReady?: boolean;
}
