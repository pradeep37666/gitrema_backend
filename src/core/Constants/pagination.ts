import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from '../Helpers/custom.validators';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ default: 10 })
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @ApiPropertyOptional({ default: true })
  @ToBoolean()
  @IsBoolean()
  @Type(() => Boolean)
  pagination?: boolean;

  @IsString()
  @ApiPropertyOptional({ default: '_id' })
  @IsOptional()
  sortBy?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({ default: -1 })
  @Type(() => Number)
  @IsIn([1, -1])
  sortDirection?: number;
}

export const pagination = { allowDiskUse: true };

export const DefaultSort = { _id: -1 };
