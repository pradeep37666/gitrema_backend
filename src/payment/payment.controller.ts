import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PaymentInitiateDto, PaymentSplitDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';
import { RefundDto } from './dto/refund.dto';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
@ApiHeader({ name: 'lang' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('take-payment')
  async create(
    @Request() req,
    @Body() paymentDetails: PaymentInitiateDto,
  ): Promise<any> {
    return await this.paymentService.create(req, paymentDetails);
  }

  @Post('refund')
  async refund(@Request() req, @Body() dto: RefundDto): Promise<any> {
    return await this.paymentService.refund(req, dto);
  }

  @Post('split')
  async split(@Request() req, @Body() dto: PaymentSplitDto) {
    return await this.paymentService.split(req, dto);
  }
}
