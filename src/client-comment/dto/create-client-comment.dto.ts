import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateClientCommentDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  comment: string;
}
