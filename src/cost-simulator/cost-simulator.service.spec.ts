import { Test, TestingModule } from '@nestjs/testing';
import { CostSimulatorService } from './cost-simulator.service';

describe('CostSimulatorService', () => {
  let service: CostSimulatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostSimulatorService],
    }).compile();

    service = module.get<CostSimulatorService>(CostSimulatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
