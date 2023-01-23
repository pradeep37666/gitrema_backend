import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';

import { PuppeteerModule } from 'nest-puppeteer';

import { ConfigModule, ConfigService } from '@nestjs/config';

import appConfigurations from './config/app.configuration';
import mongoConfiguration from './config/mongo.configuration';
import awsConfiguration from './config/aws.configuration';
import arbPgConfiguration from './config/arb-pg.configuration';
import mailConfiguration from './config/mail.configuration';
import asmscSmsConfiguration from './config/asmsc-sms.configuration';

import { UserModule } from './users/users.module';
import { SupplierModule } from './supplier/Supplier.module';
import { RoleModule } from './role/role.module';
import { EnumModule } from './core/enum/enum.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfigurations,
        mongoConfiguration,
        awsConfiguration,
        arbPgConfiguration,
        mailConfiguration,
        asmscSmsConfiguration,
      ],
    }),
    MongooseModule.forRootAsync({
      //imports: [GlobalConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('mongo.dbUrl'), // Loaded from .ENV
      }),
    }),
    PuppeteerModule.forRoot({
      isGlobal: true,
      executablePath: '/usr/bin/google-chrome',
    }),
    UserModule,
    SupplierModule,
    RoleModule,
    EnumModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // { provide: APP_GUARD, useClass: PermissionGuard },
    Logger,
  ],
})
export class AppModule {}
