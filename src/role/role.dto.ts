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
import { SocketEvents } from 'src/socket-io/enum/events.enum';

export class PermissionDto {
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

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  screenDisplays: string[];

  @ApiProperty({
    type: [String],
    enum: SocketEvents,
    enumName: 'SocketEvents',
  })
  @IsEnum(SocketEvents, { each: true })
  @IsNotEmpty()
  events: SocketEvents[];

  @ApiPropertyOptional({ type: String, enum: RoleSlug, enumName: 'RoleSlug' })
  @IsEnum(RoleSlug)
  @IsOptional()
  slug: RoleSlug;
}

export class RoleUpdateDto extends PartialType(RoleCreateDto) {}
