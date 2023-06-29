import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from 'src/core/Helpers/custom.validators';

export class QueryMenuItemDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ required: false })
  @ToBoolean()
  @IsBoolean()
  @IsOptional()
  active: boolean;
}
