import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '../invoice.enum';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNotIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
  isBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class InvoiceItemDto {
  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.itemId)
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.itemId)
  @IsNumber()
  @IsNotEmpty()
  totalWithTax: number;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.description)
  @IsMongoId()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  quantity: number;
}
export class CreateInvoiceDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ type: String, enum: InvoiceType, enumName: 'InvoiceType' })
  @IsEnum(InvoiceType)
  @IsNotIn([InvoiceType.Receipt])
  @IsNotEmpty()
  type: InvoiceType;

  @ApiProperty({ required: false, type: [InvoiceItemDto] })
  @ValidateIf((o) => o.type == InvoiceType.CreditMemo)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsArray()
  @IsNotEmpty()
  items?: any[];

  invoiceNumber?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  print?: boolean;
}
