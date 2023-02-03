import { Logger, Module } from '@nestjs/common';
import { EnumController } from './enum.controller';
import { EnumService } from './enum.service';

@Module({
  controllers: [EnumController],
  providers: [EnumService, Logger],
})
export class EnumModule {}
