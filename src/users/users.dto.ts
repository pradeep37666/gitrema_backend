import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsMongoId,
  IsUrl,
  IsBoolean,
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
  email?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  role?: Role;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  kitchenQueue?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  tableRegion?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  cashier?: string;
}

export class UserUpdateDto extends PartialType(
  OmitType(UserCreateDto, ['email'] as const),
) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefaultWaiter?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  paused?: boolean;
}

export class ImpersonateSupplierDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  supplierId: string;
}
