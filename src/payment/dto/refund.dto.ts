import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator';

export class RefundDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
