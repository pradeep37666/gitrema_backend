import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional } from 'class-validator';
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
}

export const pagination = { allowDiskUse: true };

export const DefaultSort = { _id: -1 };
