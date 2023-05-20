import { Test, TestingModule } from '@nestjs/testing';
import { SelectedVendorService } from './selected-vendor.service';

describe('SelectedVendorService', () => {
  let service: SelectedVendorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SelectedVendorService],
    }).compile();

    service = module.get<SelectedVendorService>(SelectedVendorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
