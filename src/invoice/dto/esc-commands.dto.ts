import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '../invoice.enum';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class EscCommandsDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  invoiceId: string;

  @ApiProperty({
    type: String,
    enum: InvoiceType,
    enumName: 'InvoiceType',
  })
  @IsEnum(InvoiceType)
  @IsNotEmpty()
  type: InvoiceType;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  printerId: string;
}
