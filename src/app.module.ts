import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';

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
import { EnumModule } from './enum/enum.module';
import { TransactionModule } from './transaction/transaction.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './permission/permission.guard';
import { EmailTemplateModule } from './notification/email-templates/email-template.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { TableModule } from './table/table.module';
import { PermissionModule } from './permission/permission.module';
import { MenuModule } from './menu/menu.module';
import { QrCodeModule } from './qr-code/qr-code.module';
import { KitchenQueueModule } from './kitchen-queue/kitchen-queue.module';
import { CashierModule } from './cashier/cashier.module';
import { ClientCommentModule } from './client-comment/client-comment.module';
import { ClientFeedbackModule } from './client-feedback/client-feedback.module';

import { SeedModule } from './seed/seed.module';
import { PaymentSetupModule } from './payment-setup/payment-setup.module';
import { FileUploaderModule } from './file-uploader/file-uploader.module';
import { ListModule } from './list/list.module';
import { ActivityModule } from './activity/activity.module';
import { WaitingQueueModule } from './waiting-queue/waiting-queue.module';
import { ReservationModule } from './reservation/reservation.module';
import { OrderModule } from './order/order.module';
import { OfferModule } from './offer/offer.module';
import { PaymentModule } from './payment/payment.module';
import { PuppeteerModule } from 'nest-puppeteer';
import { InvoiceModule } from './invoice/invoice.module';

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
    AuthModule,
    UserModule,
    SupplierModule,
    PermissionModule,
    RoleModule,
    EnumModule,
    TransactionModule,
    EmailTemplateModule,
    RestaurantModule,
    TableModule,
    MenuModule,
    KitchenQueueModule,
    QrCodeModule,
    CashierModule,
    ClientCommentModule,
    ClientFeedbackModule,
    PaymentSetupModule,

    SeedModule,
    FileUploaderModule,
    ListModule,
    ActivityModule,
    WaitingQueueModule,
    ReservationModule,
    OrderModule,
    OfferModule,
    PaymentModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_GUARD, useClass: PermissionGuard },
    Logger,
  ],
})
export class AppModule {}
