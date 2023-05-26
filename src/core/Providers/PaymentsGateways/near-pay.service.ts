import { Injectable } from '@nestjs/common';

import { PaymentStatus } from 'src/core/Constants/enum';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';

import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class NearPayService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly socketIoGateway: SocketIoGateway,
  ) {}

  async approved(dto) {
    const transaction = await this.transactionService.update(
      dto?.transaction_uuid,
      {
        pgResponse: dto,
        status: PaymentStatus.Success,
      },
    );

    if (transaction) {
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
    const transaction = await this.transactionService.update(
      dto?.transaction_uuid,
      {
        pgResponse: dto,
        status: PaymentStatus.Failed,
      },
    );
    if (transaction) {
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
