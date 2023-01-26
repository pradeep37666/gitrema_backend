import { PartialType } from '@nestjs/swagger';
import { CreateQrCodeDto } from './create-qr-code.dto';

export class UpdateQrCodeDto extends PartialType(CreateQrCodeDto) {}
