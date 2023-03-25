import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateGlobalConfigDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  deliveryMargin: number;
}
