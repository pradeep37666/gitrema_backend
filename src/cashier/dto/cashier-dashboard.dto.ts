import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsMongoId, IsOptional } from 'class-validator';

export class CashierDashboardDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.toString().split(','))
  restaurantId: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  @Type(() => String)
  @Transform(({ value }) => value.toString().split(','))
  cashierId: string[];
}
