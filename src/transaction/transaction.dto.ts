import { IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from 'src/core/Constants/enum';
import { PaymentMethod } from 'src/payment/enum/en.enum';

export class TransactionQueryDto {
  @IsEnum(PaymentMethod)
  @ApiPropertyOptional({
    type: String,
    enum: PaymentMethod,
    enumName: 'PaymentMethod',
  })
  @IsOptional()
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  @ApiPropertyOptional({
    type: String,
    enum: PaymentStatus,
    enumName: 'PaymentStatus',
  })
  @IsOptional()
  status: PaymentStatus;

  @ApiPropertyOptional({ type: String })
  @IsMongoId()
  @IsOptional()
  supplierId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  orderId: string;
}
