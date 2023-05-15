import { Test, TestingModule } from '@nestjs/testing';
import { InventoryCountController } from './inventory-count.controller';
import { InventoryCountService } from './inventory-count.service';

describe('InventoryCountController', () => {
  let controller: InventoryCountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryCountController],
      providers: [InventoryCountService],
    }).compile();

    controller = module.get<InventoryCountController>(InventoryCountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
