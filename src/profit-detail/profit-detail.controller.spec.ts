import { Test, TestingModule } from '@nestjs/testing';
import { ProfitDetailController } from './profit-detail.controller';
import { ProfitDetailService } from './profit-detail.service';

describe('ProfitDetailController', () => {
  let controller: ProfitDetailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfitDetailController],
      providers: [ProfitDetailService],
    }).compile();

    controller = module.get<ProfitDetailController>(ProfitDetailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
