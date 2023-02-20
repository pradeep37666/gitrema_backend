import { Test, TestingModule } from '@nestjs/testing';
import { ScreenDisplayController } from './screen-display.controller';
import { ScreenDisplayService } from './screen-display.service';

describe('ScreenDisplayController', () => {
  let controller: ScreenDisplayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreenDisplayController],
      providers: [ScreenDisplayService],
    }).compile();

    controller = module.get<ScreenDisplayController>(ScreenDisplayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
