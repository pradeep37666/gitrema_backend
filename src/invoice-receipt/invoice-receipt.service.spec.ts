import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceReceiptService } from './invoice-receipt.service';

describe('InvoiceReceiptService', () => {
  let service: InvoiceReceiptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceReceiptService],
    }).compile();

    service = module.get<InvoiceReceiptService>(InvoiceReceiptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
