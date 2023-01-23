import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentSetupDto } from './create-payment-setup.dto';

export class UpdatePaymentSetupDto extends PartialType(CreatePaymentSetupDto) {}
