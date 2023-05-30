import { Module } from '@nestjs/common';

import { MailModule } from './mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import {
  Supplier,
  SupplierSchema,
} from 'src/supplier/schemas/suppliers.schema';
import { ExpoPushNotificationService } from './expo-push-notification.service';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  providers: [NotificationService, ExpoPushNotificationService],
  exports: [ExpoPushNotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}
