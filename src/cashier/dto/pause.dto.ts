import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PauseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;
}
