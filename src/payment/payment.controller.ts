import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PaymentInitiateDto, PaymentSplitDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';
import { RefundDto } from './dto/refund.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@Controller('payments')
@ApiHeader({ name: 'lang' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('take-payment')
  @PermissionGuard(PermissionSubject.Payment, Permission.Payment.CollectPayment)
  async create(
    @Request() req,
    @Body() paymentDetails: PaymentInitiateDto,
  ): Promise<any> {
    return await this.paymentService.create(req, paymentDetails);
  }

  @Post('refund')
  @PermissionGuard(PermissionSubject.Payment, Permission.Payment.Refund)
  async refund(@Request() req, @Body() dto: RefundDto): Promise<any> {
    return await this.paymentService.refund(req, dto);
  }

  @Post('split')
  @PermissionGuard(PermissionSubject.Payment, Permission.Payment.Split)
  async split(@Request() req, @Body() dto: PaymentSplitDto) {
    return await this.paymentService.split(req, dto);
  }
}
