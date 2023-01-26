import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AttachmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  filename: string;

  content?: any;
  path?: string;
  contentType?: string;
  cid?: string;
  encoding?: string;
  contentDisposition?: 'attachment' | 'inline' | undefined;
  href?: string;
}
export class SendMailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  to: string | Array<string>;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  from?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ type: [AttachmentDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cc?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  replyTo?: string;
}
