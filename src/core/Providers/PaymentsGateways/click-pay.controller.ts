import {
  BadGatewayException,
  BadRequestException,
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
import { InjectModel } from '@nestjs/mongoose';
import {
  Transaction,
  TransactionDocument,
} from 'src/transaction/schemas/transactions.schema';
import { Model } from 'mongoose';
import { PaymentGatewayService } from 'src/payment-gateway/payment-gateway.service';

@Public()
@ApiTags('Click Pay Payment Gateway')
@Controller('clickpay-webhook')
export class ClickPayController {
  constructor(
    private readonly arbPgService: ArbPgService,
    private readonly transactionService: TransactionService,
    @Inject(forwardRef(() => SupplierService))
    private readonly supplierService: SupplierService,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  @Post('process-payment-response')
  @Redirect()
  async create(@Req() req, @Body() paymentDetails: any) {
    console.log(paymentDetails);
    let transaction = await this.transactionModel.findOne({
      externalTransactionId: paymentDetails.tran_ref,
    });
    if (!transaction) {
      console.log(paymentDetails, `Something went wrong`);
      return false;
    }

    const transObj = await this.transactionService.update(transaction._id, {
      pgResponse: paymentDetails,
      status:
        paymentDetails?.payment_result?.response_status == 'A'
          ? PaymentStatus.Success
          : PaymentStatus.Failed,
    });
    if (paymentDetails?.payment_result?.response_status == 'A')
      this.transactionService.postTransactionProcess(null, transObj);
    return true;
  }
}
