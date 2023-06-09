import { Test, TestingModule } from '@nestjs/testing';
import { InventoryReportController } from './inventory-report.controller';
import { InventoryReportService } from './inventory-report.service';

describe('InventoryReportController', () => {
  let controller: InventoryReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryReportController],
      providers: [InventoryReportService],
    }).compile();

    controller = module.get<InventoryReportController>(InventoryReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
