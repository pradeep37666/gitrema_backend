import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryActivityDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  dataId: string;
}
