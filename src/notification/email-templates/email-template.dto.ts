import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import {
  Channels,
  EmailAttachments,
  EmailTemplateEvent,
  NotificationRecipients,
  CustomEvent,
  TriggerType,
} from 'src/core/Constants/enum';
import { ToBoolean } from 'src/core/Helpers/custom.validators';

export class AddEmailTemplateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  body: string;

  @IsEnum(TriggerType)
  @IsNotEmpty()
  @ApiProperty({ enum: TriggerType, type: String })
  trigger: TriggerType;

  @IsEnum(EmailTemplateEvent)
  @IsOptional()
  @ApiPropertyOptional({ enum: EmailTemplateEvent, type: String })
  event: EmailTemplateEvent;

  @IsNumber()
  @ApiPropertyOptional()
  @IsOptional()
  hours: number;

  @ApiPropertyOptional({ type: [String], enum: EmailAttachments })
  @IsArray()
  @IsEnum(EmailAttachments, { each: true })
  @IsOptional()
  attachments: EmailAttachments;

  @ApiPropertyOptional({ type: [String], enum: Channels })
  @IsArray()
  @IsEnum(Channels, { each: true })
  @IsOptional()
  channels: Channels;

  @ValidateIf((o) => o.event)
  @ApiProperty({ type: [String], enum: NotificationRecipients })
  @IsArray()
  @IsEnum(NotificationRecipients, { each: true })
  @IsNotEmpty()
  recipients: NotificationRecipients;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cc?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  replyTo?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  default: boolean;

  @ApiPropertyOptional({ type: String, enum: CustomEvent })
  @IsOptional()
  @IsEnum(CustomEvent)
  slug?: CustomEvent;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isSystem: boolean;
}

export class UpdateEmailTemplateDto extends PartialType(AddEmailTemplateDto) {
  @IsBoolean()
  @ApiPropertyOptional()
  @IsOptional()
  isActive: boolean;
}

export class EmailTemplateQueryDto {
  @ToBoolean()
  @IsOptional()
  @ApiPropertyOptional()
  @Type(() => Boolean)
  default: boolean;

  @ToBoolean()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  isActive: boolean;
}
