import { Module } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrinterController } from './printer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Printer, PrinterSchema } from './schema/printer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Printer.name, schema: PrinterSchema }]),
  ],
  controllers: [PrinterController],
  providers: [PrinterService],
})
export class PrinterModule {}
