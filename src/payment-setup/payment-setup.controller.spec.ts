import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSetupController } from './payment-setup.controller';
import { PaymentSetupService } from './payment-setup.service';

describe('PaymentSetupController', () => {
  let controller: PaymentSetupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentSetupController],
      providers: [PaymentSetupService],
    }).compile();

    controller = module.get<PaymentSetupController>(PaymentSetupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
