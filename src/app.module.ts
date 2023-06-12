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
import pushNotificationConfiguration from './config/push-notification.configuration';

import { UserModule } from './users/users.module';
import { SupplierModule } from './supplier/Supplier.module';
import { RoleModule } from './role/role.module';
import { EnumModule } from './enum/enum.module';
import { TransactionModule } from './transaction/transaction.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './permission/permission.guard';

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
import { CustomerModule } from './customer/customer.module';
import { ScreenDisplayModule } from './screen-display/screen-display.module';
import { FeatureModule } from './feature/feature.module';
import { PackageModule } from './package/package.module';
import { SocketIoModule } from './socket-io/socket-io.module';
import { ReportModule } from './reports/report.module';
import { ImportModule } from './import/import.module';

import { GlobalConfigModule } from './global-config/global-config.module';
import { TestDataModule } from './test-data/test-data.module';
import { AdminModule } from './admin/admin.module';
import { DeliveryModule } from './delivery/delivery.module';
import taqnyatSmsConfiguration from './config/taqnyat-sms.configuration';
import yallowDeliveryConfiguration from './config/yallow-delivery.configuration';
import { NotificationModule } from './notification/notification.module';
import { GooglePlacesModule } from './google-places/google-places.module';
import * as path from 'path';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
  HeaderResolver,
} from 'nestjs-i18n';
import { AllExceptionsFilter } from './core/Filters/all-exception.filter';
import { VendorModule } from './vendor/vendor.module';
import { MaterialModule } from './material/material.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchaseOrderModule } from './purchase-order/purchase-order.module';
import { UnitOfMeasureModule } from './unit-of-measure/unit-of-measure.module';
import { GoodsReceiptModule } from './goods-receipt/goods-receipt.module';
import { RecipeModule } from './recipe/recipe.module';
import { ProductionEventModule } from './production-event/production-event.module';
import { WasteEventModule } from './waste-event/waste-event.module';
import { InventoryCountModule } from './inventory-count/inventory-count.module';
import { ProfitDetailModule } from './profit-detail/profit-detail.module';
import { InvoiceReceiptModule } from './invoice-receipt/invoice-receipt.module';
import { SelectedVendorModule } from './selected-vendor/selected-vendor.module';
import { VendorMaterialModule } from './vendor-material/vendor-material.module';
import { PaymentGatewayModule } from './payment-gateway/payment-gateway.module';
import { CustomerConditionModule } from './customer-condition/customer-condition.module';
import { InventoryReportModule } from './inventory-report/inventory-report.module';
//import { CostSimulatorModule } from './cost-simulator/cost-simulator.module';
import { PrinterModule } from './printer/printer.module';

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
        //asmscSmsConfiguration,
        taqnyatSmsConfiguration,
        yallowDeliveryConfiguration,
        pushNotificationConfiguration,
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
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    AuthModule,
    UserModule,
    SupplierModule,
    PermissionModule,
    RoleModule,
    EnumModule,
    TransactionModule,
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
    CustomerModule,
    ScreenDisplayModule,
    FeatureModule,
    PackageModule,
    ReportModule,
    SocketIoModule,
    ImportModule,
    PrinterModule,
    GlobalConfigModule,
    TestDataModule,
    AdminModule,
    DeliveryModule,
    NotificationModule,
    GooglePlacesModule,
    // VendorModule,
    MaterialModule,

    InventoryModule,
    PurchaseOrderModule,
    GoodsReceiptModule,
    UnitOfMeasureModule,
    RecipeModule,
    ProductionEventModule,
    WasteEventModule,
    InventoryCountModule,
    ProfitDetailModule,
    InvoiceReceiptModule,
    SelectedVendorModule,
    VendorMaterialModule,
    PaymentGatewayModule,
    CustomerConditionModule,
    InventoryReportModule,
    CostSimulatorModule,
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
    // {
    //   provide: APP_FILTER,
    //   useClass: AllExceptionsFilter,
    // },
  ],
})
export class AppModule {}
