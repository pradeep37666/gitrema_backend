import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AnswerOption } from '../enum/en.enum';
import { Type } from 'class-transformer';

export class QuestionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  questionAr: string;

  @ApiProperty({ type: String, enum: AnswerOption, enumName: 'AnswerOption' })
  @IsEnum(AnswerOption)
  @IsNotEmpty()
  answerOption: AnswerOption;
}
export class CreateClientFeedbackDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsNotEmpty()
  questions: QuestionDto[];

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  active: boolean;
}
