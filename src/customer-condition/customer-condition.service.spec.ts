import { Test, TestingModule } from '@nestjs/testing';
import { CustomerConditionService } from './customer-condition.service';

describe('CustomerConditionService', () => {
  let service: CustomerConditionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerConditionService],
    }).compile();

    service = module.get<CustomerConditionService>(CustomerConditionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
