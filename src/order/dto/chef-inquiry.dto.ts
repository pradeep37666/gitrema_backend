import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class ChefInquiryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  comment: string;
}
