import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateOfferDto } from './create-offer.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
