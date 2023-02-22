import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChefInquiryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  chefRequestedClarification?: boolean;
}
