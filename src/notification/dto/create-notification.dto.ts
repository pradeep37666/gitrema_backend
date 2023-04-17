import { ApiProperty } from '@nestjs/swagger';
import {
  Attachments,
  NotificationType,
  OrderEvents,
  RecipientTypes,
} from '../enum/en.enum';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  isArray,
} from 'class-validator';
import { OrderType } from 'src/order/enum/en.enum';

export class CreateNotificationDto {
  @ApiProperty({
    type: [String],
    enum: NotificationType,
    enumName: 'NotificationType',
  })
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @IsNotEmpty()
  channels: NotificationType[];

  @ApiProperty({ type: String, enum: OrderType, enumName: 'OrderType' })
  @IsEnum(OrderType)
  @IsNotEmpty()
  orderType: OrderType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subject: string;

  @ApiProperty({
    type: [String],
    enum: OrderEvents,
    enumName: 'OrderEvents',
  })
  @IsArray()
  @IsEnum(OrderEvents, { each: true })
  @IsNotEmpty()
  events: OrderEvents[];

  @ApiProperty({
    type: [String],
    enum: RecipientTypes,
    enumName: 'RecipientTypes',
  })
  @IsArray()
  @IsEnum(RecipientTypes, { each: true })
  @IsNotEmpty()
  recipientTypes: RecipientTypes[];

  @ApiProperty({
    type: [String],
    enum: Attachments,
    enumName: 'Attachments',
  })
  @IsArray()
  @IsEnum(Attachments, { each: true })
  @IsNotEmpty()
  attachments: Attachments[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsEmail(undefined, { each: true })
  customRecipients: string[];
}
