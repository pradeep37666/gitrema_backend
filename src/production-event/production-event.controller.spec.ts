import { Test, TestingModule } from '@nestjs/testing';
import { ProductionEventController } from './production-event.controller';
import { ProductionEventService } from './production-event.service';

describe('ProductionEventController', () => {
  let controller: ProductionEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionEventController],
      providers: [ProductionEventService],
    }).compile();

    controller = module.get<ProductionEventController>(ProductionEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
