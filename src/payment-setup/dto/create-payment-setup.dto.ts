import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Bank } from '../enum/en.enum';

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

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  pos: boolean;
}
export class CreatePaymentSetupDto {
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
  bankAccountHolder?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankAccountHolderEmail?: string;

  @ApiProperty({ required: false, type: String, enum: Bank, enumName: 'Bank' })
  @IsEnum(Bank)
  @IsOptional()
  bankName?: Bank;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  otherBank?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  iban?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  bankIdCode?: string;
}
