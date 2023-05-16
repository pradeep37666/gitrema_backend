import { Controller } from '@nestjs/common';
import { ProfitDetailService } from './profit-detail.service';

@Controller('profit-detail')
export class ProfitDetailController {
  constructor(private readonly profitDetailService: ProfitDetailService) {}
}
