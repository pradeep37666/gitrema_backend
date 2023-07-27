import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

import { PrinterType } from 'src/printer/enum/en';
import { DeliveryStatus } from '../enum/en.enum';

export class ChangeDeliveryStatusDto {
  @ApiProperty({
    enum: DeliveryStatus,
    enumName: 'DeliveryStatus',
  })
  @IsEnum(DeliveryStatus)
  @IsOptional()
  deliveryStatus: DeliveryStatus;
}
