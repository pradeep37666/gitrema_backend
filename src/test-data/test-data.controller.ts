import { Controller } from '@nestjs/common';
import { TestDataService } from './test-data.service';

@Controller('test-data')
export class TestDataController {
  constructor(private readonly testDataService: TestDataService) {}
}
