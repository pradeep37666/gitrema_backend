import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceiptController } from './goods-receipt.controller';
import { GoodsReceiptService } from './goods-receipt.service';

describe('GoodsReceiptController', () => {
  let controller: GoodsReceiptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceiptController],
      providers: [GoodsReceiptService],
    }).compile();

    controller = module.get<GoodsReceiptController>(GoodsReceiptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
