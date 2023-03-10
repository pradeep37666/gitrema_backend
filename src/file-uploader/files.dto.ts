import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileUploadType } from 'src/core/Constants/enum';

export class MultipleFileDto {
  @ApiProperty({ type: Array, format: 'binary' })
  files: any[];

  // @ApiProperty({
  //   type: String,
  //   enum: FileUploadType,
  //   enumName: 'FileUploadType',
  // })
  // @IsNotEmpty()
  // @IsString()
  // type: FileUploadType;
}
