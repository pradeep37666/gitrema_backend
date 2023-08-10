import { Test, TestingModule } from '@nestjs/testing';
import { OrderSourceService } from './order-source.service';

describe('OrderSourceService', () => {
  let service: OrderSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderSourceService],
    }).compile();

    service = module.get<OrderSourceService>(OrderSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
