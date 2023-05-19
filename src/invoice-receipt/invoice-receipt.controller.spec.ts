import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceReceiptController } from './invoice-receipt.controller';
import { InvoiceReceiptService } from './invoice-receipt.service';

describe('InvoiceReceiptController', () => {
  let controller: InvoiceReceiptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceReceiptController],
      providers: [InvoiceReceiptService],
    }).compile();

    controller = module.get<InvoiceReceiptController>(InvoiceReceiptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
