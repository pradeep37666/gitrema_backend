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
  @ValidateIf((o) => !o.orderNumber)
  @IsMongoId()
  @IsNotEmpty()
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
  @ValidateIf((o) => !o.orderId)
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  invoiceNumber: string;
}
