import { Test, TestingModule } from '@nestjs/testing';
import { PaymentSetupService } from './payment-setup.service';

describe('PaymentSetupService', () => {
  let service: PaymentSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentSetupService],
    }).compile();

    service = module.get<PaymentSetupService>(PaymentSetupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
