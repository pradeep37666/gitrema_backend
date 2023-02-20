import { ApiProperty } from '@nestjs/swagger';

import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class GroupOrderDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  orderIds: string[];
}
