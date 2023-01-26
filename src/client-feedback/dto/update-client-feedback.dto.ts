import {
  CreateClientFeedbackDto,
  QuestionDto,
} from './create-client-feedback.dto';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class UpdateQuestionDto extends QuestionDto {
  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  _id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  active: boolean;
}
export class UpdateClientFeedbackDto extends PartialType(
  OmitType(CreateClientFeedbackDto, ['questions'] as const),
) {
  @ApiProperty({ type: [QuestionDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  @IsArray()
  questions: UpdateQuestionDto[];
}
