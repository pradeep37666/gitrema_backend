import { Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDocument } from './schemas/order.schema';

import { OrderStatus, OrderType } from './enum/en.enum';

import { replaceAll } from 'src/core/Helpers/universal.helper';

import {
  Customer,
  CustomerDocument,
} from 'src/customer/schemas/customer.schema';
import { WhatsappService } from 'src/core/Providers/http-caller/whatsapp.service';
import { OrderNotifications } from './constant/whatsapp-templates.constant';

@Injectable()
export class OrderNotificationService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    private readonly whatsappService: WhatsappService,
  ) {}

  async triggerOrderNotification(order: OrderDocument) {
    // send whatsapp notification for pickup order
    let template = null;
    if (order.orderType == OrderType.Pickup) {
      switch (order.status) {
        case OrderStatus.New:
          template =
            OrderNotifications[OrderType.Pickup]?.OrderCreateNotification['en'];
          break;
        case OrderStatus.DonePreparing:
          template =
            OrderNotifications[OrderType.Pickup]?.OrderReadyNotification['en'];
          break;
      }
      if (template) {
        await this.triggerWhatsappNotification(order, template);
      }
    }
  }

  async triggerWhatsappNotification(order: OrderDocument, template: string) {
    let phoneNumber = order.contactNumber;

    let customer = null;
    if (!phoneNumber && order.customerId) {
      customer = await this.customerModel.findById(order.customerId);
      if (customer) {
        phoneNumber = customer.phoneNumber;
      }
    }
    if (phoneNumber) {
      template = this.prepareMessage(order, template, customer);
      const response = await this.whatsappService.sendMessage(
        phoneNumber,
        template,
      );

      console.log(`Whats app message status ---`, {
        supplierId: order.supplierId.toString(),
        phoneNumber,
        template,
      });
    }
  }
  prepareMessage(
    order: OrderDocument,
    template: string,
    customer: CustomerDocument,
  ) {
    const wordsToReplace = {
      '{{CustomerName}}': customer ? customer.name : order.name,
      '{{OrderNumber}}': order.orderNumber,
    };
    return replaceAll(template, wordsToReplace);
  }
}
