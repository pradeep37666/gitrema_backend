import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryKitchenQueueDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  userId: string;
}
