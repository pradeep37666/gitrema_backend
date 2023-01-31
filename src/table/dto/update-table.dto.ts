import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTableDto } from './create-table.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTableDto extends PartialType(CreateTableDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  waiterNeeded: boolean;
}
