import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Table, TableSchema } from './schemas/table.schema';
import { TableLog, TableLogSchema } from './schemas/table-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Table.name, schema: TableSchema },
      { name: TableLog.name, schema: TableLogSchema },
    ]),
  ],
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}
