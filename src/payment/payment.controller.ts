import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentInitiateDto, PaymentSplitDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('take-payment')
  async create(
    @Request() req,
    @Body() paymentDetails: PaymentInitiateDto,
  ): Promise<any> {
    return await this.paymentService.create(req, paymentDetails);
  }

  @Post('split')
  async split(@Request() req, @Body() dto: PaymentSplitDto) {
    return await this.paymentService.split(req, dto);
  }
}
