import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { OfferType } from '../enum/en.enum';

export class QueryOfferDto {
  @ApiProperty({ type: String, enum: OfferType })
  @IsNotEmpty()
  @IsEnum(OfferType)
  offerType: OfferType;
}
