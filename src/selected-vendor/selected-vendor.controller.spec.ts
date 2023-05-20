import { Test, TestingModule } from '@nestjs/testing';
import { SelectedVendorController } from './selected-vendor.controller';
import { SelectedVendorService } from './selected-vendor.service';

describe('SelectedVendorController', () => {
  let controller: SelectedVendorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SelectedVendorController],
      providers: [SelectedVendorService],
    }).compile();

    controller = module.get<SelectedVendorController>(SelectedVendorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
