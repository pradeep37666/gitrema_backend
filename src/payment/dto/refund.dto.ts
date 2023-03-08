import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RefundDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  cashierId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
