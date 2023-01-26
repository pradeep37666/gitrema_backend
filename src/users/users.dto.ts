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
  @IsOptional()
  @IsString()
  @IsEmail()
  @ApiProperty({ required: false })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsMongoId()
  role?: Role;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ required: false })
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
