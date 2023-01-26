import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateKitchenQueueDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nameAr: string;
}
