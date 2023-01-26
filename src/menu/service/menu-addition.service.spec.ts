import { Test, TestingModule } from '@nestjs/testing';
import { MenuAdditionService } from './menu-addition.service';

describe('MenuAdditionService', () => {
  let service: MenuAdditionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuAdditionService],
    }).compile();

    service = module.get<MenuAdditionService>(MenuAdditionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
