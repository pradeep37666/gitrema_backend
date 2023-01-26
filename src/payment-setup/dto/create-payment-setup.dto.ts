import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PaymentOptionDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  ePayment: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  cashPayment: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  rewardsClaim: boolean;
}
export class CreatePaymentSetupDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ type: PaymentOptionDto })
  @Type(() => PaymentOptionDto)
  @ValidateNested()
  @IsNotEmpty()
  inStore: PaymentOptionDto;

  @ApiProperty({ type: PaymentOptionDto })
  @Type(() => PaymentOptionDto)
  @ValidateNested()
  @IsNotEmpty()
  delivery: PaymentOptionDto;

  @ApiProperty({ type: PaymentOptionDto })
  @Type(() => PaymentOptionDto)
  @ValidateNested()
  @IsNotEmpty()
  pickup: PaymentOptionDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankAccountHolder: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankAccountHolderEmail: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  otherBank: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  iban: string;
}
