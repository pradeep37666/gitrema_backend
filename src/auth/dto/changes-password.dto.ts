import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}

export class RecoverPassword {
  currentPassword?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
