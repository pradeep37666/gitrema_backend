import { Test, TestingModule } from '@nestjs/testing';
import { KitchenQueueService } from './kitchen-queue.service';

describe('KitchenQueueService', () => {
  let service: KitchenQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KitchenQueueService],
    }).compile();

    service = module.get<KitchenQueueService>(KitchenQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
