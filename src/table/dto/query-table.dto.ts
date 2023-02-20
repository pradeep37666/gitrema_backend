import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose, { ObjectId } from 'mongoose';

export class QueryTableDto {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: any;

  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  tableRegionId: any;
}
