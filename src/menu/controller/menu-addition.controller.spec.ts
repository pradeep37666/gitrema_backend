import { Test, TestingModule } from '@nestjs/testing';
import { MenuAdditionController } from './menu-addition.controller';

describe('MenuAdditionController', () => {
  let controller: MenuAdditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuAdditionController],
    }).compile();

    controller = module.get<MenuAdditionController>(MenuAdditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
