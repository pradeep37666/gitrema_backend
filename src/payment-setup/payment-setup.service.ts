import { Injectable } from '@nestjs/common';
import { CreatePaymentSetupDto } from './dto/create-payment-setup.dto';
import { UpdatePaymentSetupDto } from './dto/update-payment-setup.dto';

@Injectable()
export class PaymentSetupService {
  create(createPaymentSetupDto: CreatePaymentSetupDto) {
    return 'This action adds a new paymentSetup';
  }

  findAll() {
    return `This action returns all paymentSetup`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentSetup`;
  }

  update(id: number, updatePaymentSetupDto: UpdatePaymentSetupDto) {
    return `This action updates a #${id} paymentSetup`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentSetup`;
  }
}
