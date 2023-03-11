import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Table, TableSchema } from './schemas/table.schema';
import { TableLog, TableLogSchema } from './schemas/table-log.schema';
import { User, UserSchema } from 'src/users/schemas/users.schema';
import { TableLogService } from './table-log.service';
import { Order, OrderSchema } from 'src/order/schemas/order.schema';
import { SocketIoModule } from 'src/socket-io/socket-io.module';
import { TableHelperService } from './table-helper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Table.name, schema: TableSchema },
      { name: TableLog.name, schema: TableLogSchema },
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    SocketIoModule,
  ],
  controllers: [TableController],
  providers: [TableService, TableLogService, TableHelperService],
  exports: [TableService, TableLogService, TableHelperService],
})
export class TableModule {}
