import { Test, TestingModule } from '@nestjs/testing';
import { WasteEventController } from './waste-event.controller';
import { WasteEventService } from './waste-event.service';

describe('WasteEventController', () => {
  let controller: WasteEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteEventController],
      providers: [WasteEventService],
    }).compile();

    controller = module.get<WasteEventController>(WasteEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
