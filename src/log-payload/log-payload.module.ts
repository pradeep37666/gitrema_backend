import { Module } from '@nestjs/common';
import { LogPayloadService } from './log-payload.service';
import { LogPayloadController } from './log-payload.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestLog, RequestLogSchema } from './schemas/request-log.schema';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestLog.name, schema: RequestLogSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [LogPayloadController],
  providers: [LogPayloadService],
  exports: [LogPayloadService],
})
export class LogPayloadModule {}
