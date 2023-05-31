import { Test, TestingModule } from '@nestjs/testing';
import { CustomerConditionController } from './customer-condition.controller';
import { CustomerConditionService } from './customer-condition.service';

describe('CustomerConditionController', () => {
  let controller: CustomerConditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerConditionController],
      providers: [CustomerConditionService],
    }).compile();

    controller = module.get<CustomerConditionController>(CustomerConditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
