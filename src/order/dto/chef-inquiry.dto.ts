import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChefInquiryDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  chefRequestedClarification?: boolean;
}
