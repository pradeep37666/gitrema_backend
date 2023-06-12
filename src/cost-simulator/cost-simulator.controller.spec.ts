import { Test, TestingModule } from '@nestjs/testing';
import { CostSimulatorController } from './cost-simulator.controller';
import { CostSimulatorService } from './cost-simulator.service';

describe('CostSimulatorController', () => {
  let controller: CostSimulatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CostSimulatorController],
      providers: [CostSimulatorService],
    }).compile();

    controller = module.get<CostSimulatorController>(CostSimulatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
