import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalConfigService } from './global-config.service';
import { GlobalConfigController } from './global-config.controller';
import {
  GlobalConfig,
  GlobalConfigSchema,
} from './schema/global-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GlobalConfig.name, schema: GlobalConfigSchema },
    ]),
  ],
  controllers: [GlobalConfigController],
  providers: [GlobalConfigService],
  exports: [GlobalConfigService],
})
export class GlobalConfigModule {}
