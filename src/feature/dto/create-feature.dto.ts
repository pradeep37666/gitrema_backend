import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PermissionActions } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { PermissionDto } from 'src/role/role.dto';

export class CreateFeatureDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @Type(() => PermissionDto)
  @ValidateNested({ each: true })
  @IsNotEmpty()
  permissions: PermissionDto[];
}
