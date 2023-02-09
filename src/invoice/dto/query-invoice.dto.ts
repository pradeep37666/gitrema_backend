import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '../invoice.enum';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class QueryInvoiceDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ required: false, type: String, enum: InvoiceType })
  @IsEnum(InvoiceType)
  @IsOptional()
  type: InvoiceType;
}
