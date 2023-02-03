import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RoleSlug } from 'src/core/Constants/enum';
import { PermissionActions } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';

class PermissionDto {
  @ApiProperty({
    type: String,
    enum: PermissionSubject,
    enumName: 'PermissionSubject',
  })
  @IsEnum(PermissionSubject)
  @IsNotEmpty()
  subject: PermissionSubject;

  @ApiProperty({
    type: [String],
    enum: PermissionActions,
    enumName: 'PermissionActions',
  })
  @IsEnum(PermissionActions, { each: true })
  @IsNotEmpty()
  permissions: PermissionActions[];
}
export class RoleCreateDto {
  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  supplierId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @Type(() => PermissionDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  permissions: PermissionDto[];

  @ApiPropertyOptional({ type: String, enum: RoleSlug, enumName: 'RoleSlug' })
  @IsEnum(RoleSlug)
  @IsOptional()
  slug: RoleSlug;
}

export class RoleUpdateDto extends PartialType(RoleCreateDto) {}
