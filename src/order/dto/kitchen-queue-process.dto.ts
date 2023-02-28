import { ApiProperty } from '@nestjs/swagger';

import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
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
