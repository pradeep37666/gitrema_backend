import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class InvalidateCacheDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  supplierId: string;
}
