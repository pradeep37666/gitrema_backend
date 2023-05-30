import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaymentStatus } from 'src/core/Constants/enum';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import {
  Transaction,
  TransactionDocument,
} from 'src/transaction/schemas/transactions.schema';

import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class NearPayService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly socketIoGateway: SocketIoGateway,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async approved(dto) {
    console.log('Data Received', dto);
    const transaction = await this.transactionModel.findOne({
      uuId: dto.payload.customer_reference_number,
    });

    console.log('Transaction', transaction);

    if (transaction) {
      transaction.set({
        pgResponse: dto,
        status: PaymentStatus.Success,
      });
      transaction.save();
      await this.transactionService.postTransactionProcess(null, transaction);
      this.socketIoGateway.emit(
        transaction.supplierId.toString(),
        SocketEvents.PosTransaction,
        { transaction },
      );
      return true;
    }
    return false;
  }

  async rejected(dto) {
    const transaction = await this.transactionModel.findOne({
      uuId: dto.payload.customer_reference_number,
    });

    if (transaction) {
      transaction.set({
        pgResponse: dto,
        status: PaymentStatus.Failed,
      });
      this.socketIoGateway.emit(
        transaction.supplierId.toString(),
        SocketEvents.PosTransaction,
        { transaction },
      );
      return true;
    }
    return false;
  }
}
