import { PartialType } from '@nestjs/swagger';
import { CreateSmsProviderDto } from './create-sms-provider.dto';

export class UpdateSmsProviderDto extends PartialType(CreateSmsProviderDto) {}
