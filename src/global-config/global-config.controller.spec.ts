import { Test, TestingModule } from '@nestjs/testing';
import { GlobalConfigController } from './global-config.controller';
import { GlobalConfigService } from './global-config.service';

describe('GlobalConfigController', () => {
  let controller: GlobalConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalConfigController],
      providers: [GlobalConfigService],
    }).compile();

    controller = module.get<GlobalConfigController>(GlobalConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
