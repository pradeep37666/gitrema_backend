import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class LoginRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  alias: string;
}

export class StaffLoginDto extends OmitType(LoginRequestDto, [
  'email',
] as const) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  alias: string;
}

export class AdminLoginDto extends OmitType(LoginRequestDto, [
  'alias',
] as const) {}

export class RequestOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export class VerificationOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  supplierId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @ValidateIf((o) => !o.code || o.verificationId)
  @IsNumber()
  @IsNotEmpty()
  verificationId: number;

  @ApiProperty()
  @ValidateIf((o) => !o.code || o.verificationCode)
  @IsNumber()
  @IsNotEmpty()
  verificationCode: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  code?: string;
}

export class UserVerificationOtpDto extends OmitType(VerificationOtpDto, [
  'supplierId',
] as const) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  alias: string;
}

export class LoggedInUserPayload {
  userId: any;
  supplierId?: any;
  restaurantId?: any;
  roleId: any;
  isCustomer?: boolean;
  isWaiter?: boolean;
  userObj?: any;
  time?: any;
}
