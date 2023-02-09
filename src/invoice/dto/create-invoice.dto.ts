import { ApiProperty } from '@nestjs/swagger';
import { InvoiceType } from '../invoice.enum';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ObjectId } from 'mongoose';
import { Type } from 'class-transformer';

class ItemDto {
  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.description)
  @IsMongoId()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.itemId)
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.itemId)
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
export class CreateInvoiceDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ type: String, enum: InvoiceType })
  @IsEnum(InvoiceType)
  @IsNotEmpty()
  type: InvoiceType;

  @ApiProperty({ required: false, type: [ItemDto] })
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  @IsArray()
  @IsOptional()
  items?: ItemDto[];

  invoiceNumber?: string;
}
