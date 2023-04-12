import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class QueryDeliveryDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  orderId: string;
}
