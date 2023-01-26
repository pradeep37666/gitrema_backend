import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class QueryTableDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;
}
