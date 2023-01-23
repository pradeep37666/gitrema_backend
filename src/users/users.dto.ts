import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsUrl,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PartialType,
} from '@nestjs/swagger';

import { Role } from 'src/role/schemas/roles.schema';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsMongoId()
  role?: Role;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  whatsappNumber: string;
}

export class UserUpdateDto extends PartialType(
  OmitType(UserCreateDto, ['email'] as const),
) {
  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  profileImage: string;
}
