import { PartialType } from '@nestjs/swagger';
import { CreatePaymentSetupDto } from './create-payment-setup.dto';

export class UpdatePaymentSetupDto extends PartialType(CreatePaymentSetupDto) {}
