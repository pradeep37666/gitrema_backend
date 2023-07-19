import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsMongoId, IsOptional } from 'class-validator';

export class CashierDashboardDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  cashierId: string;
}
