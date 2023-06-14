import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '../invoice.enum';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { PrinterType } from 'src/printer/enum/en';

export class PrintInvoiceDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    required: false,
    enum: PrinterType,
    enumName: 'PrinterType',
  })
  @IsEnum(PrinterType)
  @IsOptional()
  type: PrinterType;
}
