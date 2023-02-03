import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EnumDto {
  @ApiProperty({ type: String, example: 'BedType,Role' })
  @IsString()
  enums: string;
}
