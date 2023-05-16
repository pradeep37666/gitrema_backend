import { Test, TestingModule } from '@nestjs/testing';
import { ProfitDetailService } from './profit-detail.service';

describe('ProfitDetailService', () => {
  let service: ProfitDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitDetailService],
    }).compile();

    service = module.get<ProfitDetailService>(ProfitDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
