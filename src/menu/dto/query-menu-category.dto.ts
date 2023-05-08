import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from 'src/core/Helpers/custom.validators';

export class QueryMenuCategoryDto {
  @ApiProperty({ required: false })
  @ToBoolean()
  @IsOptional()
  fetchCategoriesHavingItems: boolean;
}
