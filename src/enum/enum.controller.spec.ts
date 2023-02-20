import { Test, TestingModule } from '@nestjs/testing';
import { EnumController } from './enum.controller';

describe('EnumController', () => {
  let controller: EnumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnumController],
    }).compile();

    controller = module.get<EnumController>(EnumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
