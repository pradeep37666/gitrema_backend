import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class QueryGooglePlaceDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius: number;
}
