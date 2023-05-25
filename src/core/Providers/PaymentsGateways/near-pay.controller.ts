import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Request,
  forwardRef,
} from '@nestjs/common';
import { ArbPgService } from './arb-pg.service';
import { SupplierService } from 'src/supplier/Supplier.service';
import { PaymentStatus } from 'src/core/Constants/enum';
import { Public } from 'src/core/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from 'src/transaction/transaction.service';
import { Redirect } from '@nestjsplus/redirect';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { NearPayService } from './near-pay.service';

@Public()
@ApiTags('Near Pay')
@Controller('near-pay-webhook')
export class NearPayController {
  constructor(
    private readonly nearPayService: NearPayService,

    @Inject(forwardRef(() => SupplierService))
    private readonly supplierService: SupplierService,
  ) {}

  @Post('approved')
  async approved(@Req() req, @Body() dto: any) {
    return await this.nearPayService.approved(dto);
  }

  @Post('rejected')
  async rejected(@Req() req, @Body() dto: any) {
    return await this.nearPayService.approved(dto);
  }
}
