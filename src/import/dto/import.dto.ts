import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, ValidateIf } from 'class-validator';
import * as moment from 'moment';
import { ImportType } from '../enum/import.enum';

export class ImportDto {
  @ValidateIf((o) => o.type != ImportType.Supplier)
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ type: String, enum: ImportType, enumName: 'ImportType' })
  @IsEnum(ImportType)
  @IsNotEmpty()
  type: ImportType;

  @ApiProperty({ type: String, format: 'binary' })
  file: any;
}
