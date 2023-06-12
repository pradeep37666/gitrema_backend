import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';

import { PrinterType } from 'src/printer/enum/en';

export class QueryIdentifyPrinterDto {
  @ApiProperty({ required: true })
  @IsMongoId()
  @IsOptional()
  orderId: string;

  @ApiProperty({
    required: false,
    enum: PrinterType,
    enumName: 'PrinterType',
  })
  @IsEnum(PrinterType)
  @IsOptional()
  printerType: PrinterType;
}
