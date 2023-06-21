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
@ApiTags('Alrajhi Payment Gateway')
@Controller('arb-pg-webhook')
export class ArbPgController {
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
    const transaction = await this.transactionModel.findOne({
      externalTransactionId: paymentDetails.paymentid,
    });
    if (!transaction) {
      throw new BadRequestException(`Something went wrong`);
    }
    const paymentGateway = await this.paymentGatewayService.findOneBySupplier(
      transaction.supplierId.toString(),
    );
    await this.arbPgService.init(paymentGateway);

    const transObj = this.arbPgService.parseTransResponse(
      this.arbPgService.aesDecryption(paymentDetails.trandata),
    );

    console.log(
      transObj,
      this.arbPgService.config.frontendSuccessUrl,
      this.arbPgService.config.frontendErrorUrl,
    );
    if (transObj) {
      const transaction = await this.transactionService.update(
        transObj.trackId,
        {
          pgResponse: transObj,
          status:
            transObj.result == 'CAPTURED'
              ? PaymentStatus.Success
              : PaymentStatus.Failed,
        },
      );

      if (transObj.result == 'CAPTURED')
        this.transactionService.postTransactionProcess(null, transaction);

      const supplier = await this.supplierService.getOne(
        transaction.supplierId.toString(),
      );
      let partialUrl = transObj.udf3
        ? Buffer.from(transObj.udf3, 'base64').toString('ascii')
        : 'https://' + supplier.domain;
      const pattern = /^((http|https):\/\/)/;

      if (!pattern.test(partialUrl)) {
        partialUrl = 'http://' + partialUrl;
      }
      let url = partialUrl + '/decline?metaId=' + transObj.udf2;
      if (transObj.result == 'CAPTURED') {
        // success redirection
        url = partialUrl + '/success?metaId=' + transObj.udf2;
      }
      return { statusCode: HttpStatus.FOUND, url };
    }
    throw new BadGatewayException(VALIDATION_MESSAGES.ServerError.key);
  }
}
