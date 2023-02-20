import { Test, TestingModule } from '@nestjs/testing';
import { ScreenDisplayService } from './screen-display.service';

describe('ScreenDisplayService', () => {
  let service: ScreenDisplayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScreenDisplayService],
    }).compile();

    service = module.get<ScreenDisplayService>(ScreenDisplayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
