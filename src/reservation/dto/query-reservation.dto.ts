import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ToBoolean } from 'src/core/Helpers/custom.validators';

export class QueryReservationDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  tableRegion: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ToBoolean()
  isCancelled: boolean;
}
