import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class MoveOrderItemDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  sourceOrderId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  targetOrderId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  items: string[];
}
