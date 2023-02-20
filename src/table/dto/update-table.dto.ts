import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTableDto } from './create-table.dto';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TableStatus } from '../enum/en.enum';

export class UpdateTableDto extends PartialType(CreateTableDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  waiterNeeded: boolean;

  @ApiProperty({
    type: String,
    enum: TableStatus,
    enumName: 'TableStatus',
    required: false,
  })
  @IsEnum(TableStatus)
  @IsOptional()
  status: TableStatus;
}
