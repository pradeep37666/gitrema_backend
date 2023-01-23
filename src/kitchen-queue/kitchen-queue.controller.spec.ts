import { Test, TestingModule } from '@nestjs/testing';
import { KitchenQueueController } from './kitchen-queue.controller';
import { KitchenQueueService } from './kitchen-queue.service';

describe('KitchenQueueController', () => {
  let controller: KitchenQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KitchenQueueController],
      providers: [KitchenQueueService],
    }).compile();

    controller = module.get<KitchenQueueController>(KitchenQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
