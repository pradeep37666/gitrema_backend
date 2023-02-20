import { ApiProperty } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateWaitingQueueDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  customerId: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  tableRegion: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.customerId)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @ValidateIf((o) => !o.customerId)
  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalMembers: number;
}
