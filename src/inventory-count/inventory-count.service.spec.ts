import { Test, TestingModule } from '@nestjs/testing';
import { InventoryCountService } from './inventory-count.service';

describe('InventoryCountService', () => {
  let service: InventoryCountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryCountService],
    }).compile();

    service = module.get<InventoryCountService>(InventoryCountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
