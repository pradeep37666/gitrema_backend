import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinDate,
  ValidateIf,
} from 'class-validator';
import * as moment from 'moment';

export class CreateReservationDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  customerId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  tableRegion: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.customerId)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.customerId)
  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @ApiProperty({})
  @IsNotEmpty()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  @MinDate(new Date(moment.utc().format('YYYY-MM-DD')), {
    message:
      'minimal allowed date for scheduledDate is ' + new Date().toDateString(),
  })
  date: Date;

  @ApiProperty({ example: '20:30' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalMembers: number;
}
