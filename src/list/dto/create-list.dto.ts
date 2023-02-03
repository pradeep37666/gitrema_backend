import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ListType } from 'src/core/Constants/enum';

export class CreateListDto {
  @IsNotEmpty()
  @ApiProperty({ type: String, enum: ListType, enumName: 'ListType' })
  @IsEnum(ListType)
  type: ListType;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  nameAr: string;
}
