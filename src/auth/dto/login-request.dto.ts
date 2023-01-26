import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
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
}

export class StaffLoginDto extends OmitType(LoginRequestDto, [
  'email',
] as const) {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phoneNumber: string;
}

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

  @ApiProperty()
  @ValidateIf((o) => !(o.verificationId && o.verificationCode) || o.code)
  @IsNotEmpty()
  @IsString()
  code?: string;
}

export class LoggedInUserPayload {
  userId: any;
  supplierId?: any;
  restaurantId?: any;
  roleId: any;
}
