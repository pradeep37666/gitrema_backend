import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentSetupService } from './payment-setup.service';
import { CreatePaymentSetupDto } from './dto/create-payment-setup.dto';
import { UpdatePaymentSetupDto } from './dto/update-payment-setup.dto';

@Controller('payment-setup')
export class PaymentSetupController {
  constructor(private readonly paymentSetupService: PaymentSetupService) {}

  @Post()
  create(@Body() createPaymentSetupDto: CreatePaymentSetupDto) {
    return this.paymentSetupService.create(createPaymentSetupDto);
  }

  @Get()
  findAll() {
    return this.paymentSetupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentSetupService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentSetupDto: UpdatePaymentSetupDto) {
    return this.paymentSetupService.update(+id, updatePaymentSetupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentSetupService.remove(+id);
  }
}
