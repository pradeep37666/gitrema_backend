import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Redirect,
  Req,
  Request,
} from '@nestjs/common';
import { ArbPgService } from './arb-pg.service';
import { SupplierService } from 'src/supplier/Supplier.service';
import { PaymentStatus } from 'src/core/Constants/enum';
import { Public } from 'src/core/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { TransactionService } from 'src/transaction/transaction.service';

@Public()
//@ApiTags('Common')
@Controller('arb-pg-webhook')
export class ArbPgController {
  constructor(
    private readonly arbPgService: ArbPgService,
    private readonly transactionService: TransactionService,
    private readonly supplierService: SupplierService,
  ) {}

  @Post('process-payment-response')
  @Redirect()
  async create(@Req() req, @Body() paymentDetails: any) {
    console.log(paymentDetails.trandata);
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

      // if (transObj.result == 'CAPTURED') {
      //   this.transactionService.postOnlineTransactionSuccessCalculation(
      //     transaction,
      //     {
      //       variableFee: this.arbPgService.config.variableFee,
      //       fixedFee: this.arbPgService.config.fixedFee,
      //       taxOnFee: this.arbPgService.config.taxOnFee,
      //     },
      //   );

      //   this.transactionService.postTransactionProcess(null, transaction);
      // }

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
  }
}
