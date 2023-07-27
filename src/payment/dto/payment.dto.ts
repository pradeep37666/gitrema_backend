import {
  IsNotEmpty,
  IsString,
  IsMongoId,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateIf,
  IsUrl,
  IsCurrency,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ObjectId } from 'mongoose';
import { Type } from 'class-transformer';
import { PaymentGateways, PaymentMethod, SplitType } from '../enum/en.enum';
import { PaymentGateway } from 'src/payment-gateway/schema/payment-gateway.schema';

class ItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class PaymentInitiateDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  cashierId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ type: String, enum: PaymentMethod, enumName: 'PaymentMethod' })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  metaId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  redirectUrl?: string;

  @ApiProperty({
    required: false,
    type: String,
    enum: PaymentGateways,
    enumName: 'PaymentGateways',
  })
  @IsEnum(PaymentGateways)
  @IsOptional()
  paymentGateway?: PaymentGateways;
}

export class PaymentSplitDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  split: number;
}
