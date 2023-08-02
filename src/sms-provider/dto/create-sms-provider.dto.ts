import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Provider } from '../enum/en';
import { Type } from 'class-transformer';
import { TaqnyatCredentialsDto } from './taqnyat.dto';
import { AsmscCredentialsDto } from './asmsc.dto ';

const gatewayList = {
  Asmsc: AsmscCredentialsDto,
  Taqnyat: TaqnyatCredentialsDto,
};
export class CreateSmsProviderDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsMongoId({
    message: i18nValidationMessage('validation.MUST_BE_MONGO_ID'),
  })
  supplierId: string;

  @ApiProperty({
    type: String,
    enum: Provider,
    enumName: 'Provider',
  })
  @IsEnum(Provider, {
    message: i18nValidationMessage('validation.MUST_BE_ENUM'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  provider: Provider;

  @ApiProperty({})
  @IsNotEmpty({
    message: i18nValidationMessage('validation.NOT_EMPTY'),
  })
  @IsObject({
    message: i18nValidationMessage('validation.MUST_BE_OBJECT'),
  })
  @ValidateNested()
  @Type((t) => {
    return gatewayList[t.object.provider] || null;
  })
  credentials: TaqnyatCredentialsDto | AsmscCredentialsDto;
}
