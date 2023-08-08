import { Test, TestingModule } from '@nestjs/testing';
import { MarketPlaceController } from './market-place.controller';

describe('MarketPlaceController', () => {
  let controller: MarketPlaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketPlaceController],
    }).compile();

    controller = module.get<MarketPlaceController>(MarketPlaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
