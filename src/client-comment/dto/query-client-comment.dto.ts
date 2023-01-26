import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryClientCommentDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  restaurantId: string;
}
