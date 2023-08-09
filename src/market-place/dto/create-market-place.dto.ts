import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMarketPlaceDto {
  @ApiProperty()
  @IsMongoId()  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  value: boolean;
}
