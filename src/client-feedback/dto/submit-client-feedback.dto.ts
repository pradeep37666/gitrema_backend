import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class AnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  questionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;
}
export class SubmitClientFeedbackDto {
  @ApiProperty({ type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @IsNotEmpty()
  answers: AnswerDto[];
}
