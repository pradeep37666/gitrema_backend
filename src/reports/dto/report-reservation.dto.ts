import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class ReportReservationDto {
  @ApiProperty({ type: String, required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: any;

  @ApiProperty({
    required: false,
    type: Boolean,
  })
  @IsOptional()
  isCancelled: boolean;
}
