import { IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from 'src/core/Constants/enum';

export class TransactionQueryDto {
  @IsEnum(PaymentMethod)
  @ApiPropertyOptional({ type: String, enum: PaymentMethod })
  @IsOptional()
  paymentMethod: PaymentMethod;

  @IsEnum(PaymentStatus)
  @ApiPropertyOptional({ type: String, enum: PaymentStatus })
  @IsOptional()
  status: PaymentStatus;

  @ApiPropertyOptional({ type: String })
  @IsMongoId()
  @IsOptional()
  supplierId: string;
}
