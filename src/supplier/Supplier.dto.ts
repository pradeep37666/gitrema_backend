import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsDate,
  IsOptional,
  IsObject,
  IsMongoId,
  IsArray,
  IsBoolean,
} from 'class-validator';
import * as moment from 'moment';

class Contact {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  whatsappNumber: string;
}

class BankDetails {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  routingNumber: string;
}

class SubscriptionDetails {
  @ApiProperty()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  @IsNotEmpty()
  validTill: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

class SharedProperty {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}

class BusinessDetailsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  slogan: SharedProperty;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  about: SharedProperty;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  singleProperty: SharedProperty;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  multipleProperty: SharedProperty;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  additionalDetails: any;
}

export class AddSupplierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  crNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Contact)
  contact?: Contact;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Contact)
  propertyManager?: Contact;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetails)
  bankDetais?: BankDetails;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  allowedServices?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => BusinessDetailsDto)
  businessDetails?: BusinessDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionDetails)
  subscriptionDetails?: SubscriptionDetails;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  spn?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  hotel?: boolean;

  @ApiPropertyOptional({ type: Boolean, example: false })
  @IsOptional()
  @IsBoolean()
  affiliate?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  crNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Contact)
  contact?: Contact;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => Contact)
  propertyManager?: Contact;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BankDetails)
  bankDetais?: BankDetails;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  allowedServices?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SubscriptionDetails)
  subscriptionDetails?: SubscriptionDetails;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => BusinessDetailsDto)
  businessDetails?: BusinessDetailsDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  spn?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  hotel?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  affiliate?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  domain?: string;
}

export class FindByIdDto {
  @ApiProperty()
  @IsNotEmpty()
  supplierId: string;
}

export class SupplierQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  district: string;
}
