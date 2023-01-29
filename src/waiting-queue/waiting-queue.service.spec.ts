import { Test, TestingModule } from '@nestjs/testing';
import { WaitingQueueService } from './waiting-queue.service';

describe('WaitingQueueService', () => {
  let service: WaitingQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitingQueueService],
    }).compile();

    service = module.get<WaitingQueueService>(WaitingQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
