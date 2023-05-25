import { Test, TestingModule } from '@nestjs/testing';
import { VendorMaterialService } from './vendor-material.service';

describe('VendorMaterialService', () => {
  let service: VendorMaterialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorMaterialService],
    }).compile();

    service = module.get<VendorMaterialService>(VendorMaterialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
