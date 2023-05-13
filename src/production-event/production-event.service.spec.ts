import { Test, TestingModule } from '@nestjs/testing';
import { ProductionEventService } from './production-event.service';

describe('ProductionEventService', () => {
  let service: ProductionEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionEventService],
    }).compile();

    service = module.get<ProductionEventService>(ProductionEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
