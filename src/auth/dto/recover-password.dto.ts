import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RecoverPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  readonly email: string;
}
