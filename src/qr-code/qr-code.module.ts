import { Module } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { QrCodeController } from './qr-code.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QrCode, QrCodeSchema } from './schemas/qr-code.schema';
import { Table, TableSchema } from 'src/table/schemas/table.schema';
import { StorageModule } from 'src/core/Providers/Storage/storage.module';

@Module({
  imports: [
    StorageModule,
    MongooseModule.forFeature([
      { name: QrCode.name, schema: QrCodeSchema },
      { name: Table.name, schema: TableSchema },
    ]),
  ],
  controllers: [QrCodeController],
  providers: [QrCodeService],
})
export class QrCodeModule {}
