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
  @IsMongoId()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  comment: string;
}
