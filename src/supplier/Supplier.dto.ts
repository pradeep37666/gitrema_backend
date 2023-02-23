import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  ValidateNested,
  IsArray,
  IsMongoId,
  IsDate,
  MinDate,
} from 'class-validator';
import {
  DefaultWorkingHoursDTO,
  IndividualWorkHoursDTO,
} from 'src/restaurant/dto/create-restaurant.dto';
import * as moment from 'moment';

export class AddSupplierDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nameAr: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  about: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  aboutAr: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  vatNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  twitter: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  instagram: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  snapchat: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tiktok: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  whatsapp: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logo: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  backgroundImage: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  domain: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  crDoc: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  mancucpilityCertDoc: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  incorporationContractDoc: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ibanCertDoc: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  idDoc: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  taxEnabled: boolean;

  @ApiProperty({ required: false, example: 15 })
  @IsNumber()
  @IsOptional()
  taxRate: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  taxEnabledOnTableFee: boolean;

  @ApiProperty({ required: false, example: 0 })
  @IsNumber()
  @IsOptional()
  reservationFee: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  taxEnabledOnReservationFee: boolean;

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
  @IsBoolean()
  @IsNotEmpty()
  isDeliveryToCarEnabled: boolean;

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
  overrideWorkingHours: IndividualWorkHoursDTO[];
}

export class UpdateSupplierDto extends PartialType(AddSupplierDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  active: boolean;
}

export class AssignPackageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  packageId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => new Date(moment.utc(value).format('YYYY-MM-DD')))
  @IsDate()
  @MinDate(new Date(moment.utc().format('YYYY-MM-DD')), {
    message:
      'minimal allowed date for startDate is ' + new Date().toDateString(),
  })
  startDate?: Date;
}

export class ModifyPackageFeaturesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  features: string[];
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
}
