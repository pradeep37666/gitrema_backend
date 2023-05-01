import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Days, OrderTypes } from 'src/core/Constants/enum';

export class IndividualWorkHoursDTO {
  @ApiProperty({ type: String, enum: Days, enumName: 'Days' })
  @IsNotEmpty()
  @IsEnum(Days)
  day: Days;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  start: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  end: string;
}

class TermsAndConditionDTO {
  @ApiProperty({ type: String, enum: OrderTypes, enumName: 'OrderTypes' })
  @IsEnum(OrderTypes)
  @IsNotEmpty()
  type: OrderTypes;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  termsAr: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  termsEn: string;
}

class BeforeConfirmOrderMessageDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  en: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ar: string;
}

export class DefaultWorkingHoursDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  start: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  end: string;
}

export class LocationDto {
  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  address: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  city: string;

  @IsNumber()
  @ApiProperty({ required: false })
  @IsOptional()
  zipCode: number;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  state: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  country: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  latitude?: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  longitude?: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  district: string;
}

export class CreateRestaurantDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @Transform(({ value }) => value.replace('+', ''))
  @IsString()
  @IsNotEmpty()
  whatsappNumber: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  enableWhatsappCommunication: boolean;

  @ApiProperty({ type: BeforeConfirmOrderMessageDTO })
  @ValidateNested({ each: true })
  @Type(() => BeforeConfirmOrderMessageDTO)
  @IsNotEmpty()
  beforeConfirmOrderMessage: BeforeConfirmOrderMessageDTO;

  @ApiProperty({ type: DefaultWorkingHoursDTO })
  @ValidateNested({ each: true })
  @Type(() => DefaultWorkingHoursDTO)
  @IsNotEmpty()
  defaultWorkingHours: DefaultWorkingHoursDTO;

  @ApiProperty({ type: [IndividualWorkHoursDTO], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndividualWorkHoursDTO)
  @IsOptional()
  overrideWorkingHours?: IndividualWorkHoursDTO[];

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isMenuBrowsingEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isAppOrderEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isDeliveryEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isPickupOrderEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isScheduledOrderEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isReservationEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isWaitingEnabled: boolean;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  minimumDeliveryOrderValue: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isDeliveryToCarEnabled: boolean;

  @ApiProperty({ type: [TermsAndConditionDTO], required: false })
  @ValidateNested({ each: true })
  @Type(() => TermsAndConditionDTO)
  @IsOptional()
  terms?: TermsAndConditionDTO[];

  @ValidateNested()
  @Type(() => LocationDto)
  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  location?: LocationDto;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  pickupId: string;
}
