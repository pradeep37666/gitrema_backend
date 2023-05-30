import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from './schemas/order.schema';

import { OrderPaymentStatus, OrderStatus, OrderType } from './enum/en.enum';

import { replaceAll } from 'src/core/Helpers/universal.helper';

import {
  Customer,
  CustomerDocument,
} from 'src/customer/schemas/customer.schema';
import { WhatsappService } from 'src/core/Providers/http-caller/whatsapp.service';
import { OrderNotifications } from './constant/whatsapp-templates.constant';
import { MailService } from '../notification/mail/mail.service';
import {
  Attachments,
  NotificationStatus,
  NotificationType,
  OrderEvents,
  RecipientTypes,
} from 'src/notification/enum/en.enum';
import {
  Notification,
  NotificationDocument,
} from 'src/notification/schemas/notification.schema';
import { TaqnyatService } from 'src/core/Providers/Sms/taqnyat.service';
import { PaymentStatus } from 'src/core/Constants/enum';
import {
  TrackNotification,
  TrackNotificationDocument,
} from 'src/notification/schemas/track-notification.schema';
import { TrackNotificationDto } from 'src/notification/dto/track-notification.dto';
import { InvoiceType } from 'src/invoice/invoice.enum';
import { Invoice, InvoiceDocument } from 'src/invoice/schemas/invoice.schema';
import { InvoiceService } from 'src/invoice/invoice.service';
import { getHBVars } from 'src/core/Helpers/universal.helper';
import {
  ExpoPushNotificationService,
  ISendExpoMessages,
} from 'src/notification/expo-push-notification.service';

@Injectable()
export class OrderNotificationService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(TrackNotification.name)
    private readonly trackNotificationModel: Model<TrackNotificationDocument>,
    @InjectModel(Invoice.name)
    private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly whatsappService: WhatsappService,
    private readonly mailService: MailService,
    private readonly tanqyatService: TaqnyatService,
    @Inject(forwardRef(() => InvoiceService))
    private invoiceService: InvoiceService,
    private expoPushNotificationService: ExpoPushNotificationService,
  ) {}

  async triggerOrderNotification(
    event: OrderEvents | string,
    order: OrderDocument,
  ) {
    const notifications = await this.notificationModel.find({
      supplierId: order.supplierId,
      events: event,
      orderType: order.orderType,
    });
    if (notifications.length > 0) {
      await order.populate([
        {
          path: 'supplierId',
        },
        {
          path: 'customerId',
        },
      ]);
    }
    console.log(notifications);
    for (const i in notifications) {
      const { content, subject } = await this.prepareMessage(
        notifications[i],
        order,
      );
      console.log(content);
      for (const j in notifications[i].channels) {
        const recipients: string[] = await this.resolveRecipients(
          notifications[i].recipientTypes,
          order,
          notifications[i].channels[j],
        );
        console.log(recipients);
        switch (notifications[i].channels[j]) {
          case NotificationType.Email:
            this.triggerEmailNotification(
              notifications[i],
              recipients.concat(notifications[i].customRecipients),
              content,
              subject,
              order,
            );
            break;
          case NotificationType.Whatsapp:
            this.triggerWhatsappNotification(
              notifications[i],
              recipients,
              content,
              order,
            );
            break;
          case NotificationType.Sms:
            this.triggerSmsNotification(
              notifications[i],
              recipients,
              content,
              order,
            );
            break;
        }
      }
    }
    if (
      event == OrderEvents.OrderCreated &&
      [OrderType.Delivery, OrderType.Pickup].includes(order.orderType)
    ) {
      this.triggerPushNotification(order);
    }
  }

  async triggerPushNotification(order: OrderDocument) {
    const message: ISendExpoMessages = {
      to: order.customerId?.expoToken,
      body: `Thank you for your order #${order.orderNumber}`,
      sound: 'default',
      data: {},
    };
    await this.expoPushNotificationService.sendPushMessages([message]);
  }

  async triggerEmailNotification(
    notification: NotificationDocument,
    recipients: string[],
    content: string,
    subject: string,
    order: OrderDocument,
  ) {
    content = content.replace('\n', '<br>');

    let attachments = [];
    if (notification.attachments.length > 0)
      attachments = await this.resolveAttachments(notification, order);
    for (const i in recipients) {
      await this.mailService.send({
        to: recipients[i],
        subject,
        body: content,
        attachments: attachments,
      });
      this.storeNotificationTrack({
        supplierId: notification.supplierId.toString(),
        notificationId: notification._id.toString(),
        dataId: order._id.toString(),
        sentOn: recipients[i],
        content,
        status: NotificationStatus.Success,
        attachments: attachments.map((a) => a.filename),
      });
    }
  }

  async triggerWhatsappNotification(
    notification: NotificationDocument,
    recipients: string[],
    content: string,
    order: OrderDocument,
  ) {
    for (const i in recipients) {
      const response = await this.whatsappService.sendMessage(
        recipients[i],
        content,
      );
      let status = NotificationStatus.Failed;
      if (response) {
        status = NotificationStatus.Success;
      }
      this.storeNotificationTrack({
        supplierId: notification.supplierId.toString(),
        notificationId: notification._id.toString(),
        dataId: order._id.toString(),
        sentOn: recipients[i],
        content,
        status,
      });
    }
  }

  async triggerSmsNotification(
    notification: NotificationDocument,
    recipients: string[],
    content: string,
    order: OrderDocument,
  ) {
    for (const i in recipients) {
      const response = await this.tanqyatService.send(recipients[i], content);
      if (response.statusCode == HttpStatus.CREATED)
        this.storeNotificationTrack({
          supplierId: notification.supplierId.toString(),
          notificationId: notification._id.toString(),
          dataId: order._id.toString(),
          sentOn: recipients[i],
          content,
          status: NotificationStatus.Success,
        });
    }
  }

  async resolveRecipients(
    recipientTypes,
    order: OrderDocument,
    type: NotificationType,
  ) {
    let recipients = [];
    switch (type) {
      case NotificationType.Email:
        recipients = this.findEmails(recipientTypes, order);
        break;
      case NotificationType.Sms:
        recipients = this.findPhoneNumbers(recipientTypes, order);
      case NotificationType.Whatsapp:
        recipients = this.findWhatsappNumbers(recipientTypes, order);
    }
    return recipients;
  }

  async storeNotificationTrack(payload: TrackNotificationDto) {
    await this.trackNotificationModel.create(payload);
  }

  findEmails(recipientTypes, order: OrderDocument) {
    const recipients = [];
    for (const i in recipientTypes) {
      switch (recipientTypes[i]) {
        case RecipientTypes.Customer:
          if (order.customerId?.email) recipients.push(order.customerId.email);
          break;
        case RecipientTypes.Restaurant:
          if (order.supplierId?.email) recipients.push(order.supplierId.email);
      }
    }
    return recipients;
  }

  findPhoneNumbers(recipientTypes, order: OrderDocument) {
    const recipients = [];
    for (const i in recipientTypes) {
      switch (recipientTypes[i]) {
        case RecipientTypes.Customer:
          if (order.customerId?.phoneNumber)
            recipients.push(order.customerId.phoneNumber);
          else if (order.contactNumber) recipients.push(order.contactNumber);
          break;
        case RecipientTypes.Restaurant:
          if (order.supplierId?.phoneNumber)
            recipients.push(order.supplierId.phoneNumber);
      }
    }
    return recipients;
  }

  findWhatsappNumbers(recipientTypes, order: OrderDocument) {
    const recipients = [];
    for (const i in recipientTypes) {
      switch (recipientTypes[i]) {
        case RecipientTypes.Customer:
          if (order.customerId?.phoneNumber)
            recipients.push(order.customerId.phoneNumber);
          else if (order.contactNumber)
            recipients.push(order.contactNumber.replace('+', ''));
          break;
        case RecipientTypes.Restaurant:
          if (order.supplierId?.phoneNumber)
            recipients.push(order.supplierId.whatsapp.replace('+', ''));
      }
    }
    return recipients;
  }

  async prepareMessage(
    notification: NotificationDocument,
    order: OrderDocument,
  ) {
    const wordsToReplace = {
      '{{CustomerName}}': order.customerId ? order.customerId.name : order.name,
      '{{OrderNumber}}': order.orderNumber,
      '{{customerPhone}}': order.customerId
        ? order.customerId.phoneNumber
        : order.contactNumber,
      '{{OrderPaymentStatus}}': order.paymentStatus,
      '{{OrderType}}': order.orderType,
      '{{PreparationTime}}': `${order.preparationDetails.preparationTime} mins`,
      '{{RestaurantName}}': order.supplierId.nameAr,
      '{{RestaurantPhoneNumber}}': order.supplierId.phoneNumber,
      '{{RestaurantWhatsappNumber}}': order.supplierId.whatsapp,
      '{{RestaurantEmail}}': order.supplierId.email,
      '{{OrderSummary}}': this.prepareOrderSummary(order),
    };
    const placeholders = getHBVars(notification.content);

    if (placeholders.includes('InvoiceImageUrl')) {
      let invoice: InvoiceDocument = await this.invoiceModel.findOne({
        orderId: order._id,
        type: InvoiceType.Invoice,
        isReversedInvoice: false,
        reversedInvoiceId: null,
      });
      if (!invoice) {
        invoice = await this.invoiceService.create(null, {
          orderId: order._id,
          type: InvoiceType.Invoice,
        });
      }
      wordsToReplace['{{InvoiceImageUrl}}'] = invoice ? invoice.imageUrl : '';
    }
    return {
      content: replaceAll(notification.content, wordsToReplace),
      subject: replaceAll(notification.subject, wordsToReplace),
    };
  }

  prepareOrderSummary(order: OrderDocument) {
    let message = '\n';
    order.items.forEach((oi) => {
      message += `-- ${oi.quantity} X ${oi.menuItem.nameAr}`;
      oi.additions.forEach((oia) => {
        const options = oia.options.map((o) => {
          return o.nameAr;
        });

        message += `\n`;
        message += `  - with ${options.join(',')}`;
      });
      message += `\n`;
    });
    return message;
  }

  async resolveAttachments(
    notification: NotificationDocument,
    order: OrderDocument,
  ) {
    const attachments = [];
    for (const i in notification.attachments) {
      switch (notification.attachments[i]) {
        case Attachments.Invoice:
          let invoice: InvoiceDocument = await this.invoiceModel.findOne({
            orderId: order._id,
            type: InvoiceType.Invoice,
            isReversedInvoice: false,
            reversedInvoiceId: null,
          });
          if (!invoice) {
            invoice = await this.invoiceService.create(null, {
              orderId: order._id,
              type: InvoiceType.Invoice,
            });
          }
          if (invoice) {
            attachments.push({
              filename: invoice.imageUrl,
            });
          }
          break;
      }
    }
    return attachments;
  }
}
