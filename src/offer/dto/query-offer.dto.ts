import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { ApplicationType, OfferType } from '../enum/en.enum';

export class QueryOfferDto {
  @ApiProperty({ type: String, enum: OfferType, enumName: 'OfferType' })
  @IsNotEmpty()
  @IsEnum(OfferType)
  offerType: OfferType;

  @ApiProperty({
    type: String,
    enum: ApplicationType,
    enumName: 'ApplicationType',
    required: false,
  })
  @IsOptional()
  @IsEnum(ApplicationType)
  applicationType: ApplicationType;
}
