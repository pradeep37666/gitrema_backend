import { Test, TestingModule } from '@nestjs/testing';
import { VendorMaterialController } from './vendor-material.controller';
import { VendorMaterialService } from './vendor-material.service';

describe('VendorMaterialController', () => {
  let controller: VendorMaterialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorMaterialController],
      providers: [VendorMaterialService],
    }).compile();

    controller = module.get<VendorMaterialController>(VendorMaterialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
