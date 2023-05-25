import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { BaseQueryDto } from 'src/core/dto/base-query.dto';

export class QueryVendorMaterialDto extends BaseQueryDto {}
