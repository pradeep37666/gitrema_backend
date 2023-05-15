import { Test, TestingModule } from '@nestjs/testing';
import { WasteEventService } from './waste-event.service';

describe('WasteEventService', () => {
  let service: WasteEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WasteEventService],
    }).compile();

    service = module.get<WasteEventService>(WasteEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
