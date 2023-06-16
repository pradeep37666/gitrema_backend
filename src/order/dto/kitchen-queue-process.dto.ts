import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  isArray,
} from 'class-validator';
import { PreparationStatus } from '../enum/en.enum';

export class KitchenQueueProcessDto {
  @ApiProperty({})
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  orderItemId: string;

  @ApiProperty({
    type: String,
    enum: PreparationStatus,
    enumName: 'PreparationStatus',
  })
  @IsEnum(PreparationStatus)
  @IsNotEmpty()
  preparationStatus: PreparationStatus;
}

export class ItemPreparedDto {
  @ApiProperty({ required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  orderItemIds: string[];
}
