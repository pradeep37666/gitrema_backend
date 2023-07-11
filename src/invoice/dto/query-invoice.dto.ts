import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '../invoice.enum';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class QueryInvoiceDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  orderId: string;

  @ApiProperty({
    required: false,
    type: String,
    enum: InvoiceType,
    enumName: 'InvoiceType',
  })
  @IsEnum(InvoiceType)
  @IsOptional()
  type: InvoiceType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  invoiceNumber: string;
}
