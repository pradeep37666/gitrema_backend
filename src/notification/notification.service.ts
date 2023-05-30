import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, PaginateModel, PaginateResult, ObjectId } from 'mongoose';

import {
  DefaultSort,
  PaginationDto,
  pagination,
} from 'src/core/Constants/pagination';

import * as moment from 'moment';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModelPag: PaginateModel<NotificationDocument>,
  ) {}

  async create(
    req: any,
    dto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    return await this.notificationModel.create({
      ...dto,
      supplierId: req.user.supplierId,
      addedBy: req.user.userId,
    });
  }

  async findAll(
    req: any,
    query: QueryNotificationDto,
    paginateOptions: PaginationDto,
  ): Promise<PaginateResult<NotificationDocument>> {
    const notifications = await this.notificationModelPag.paginate(
      {
        ...query,
        supplierId: req.user.supplierId,
      },
      {
        sort: DefaultSort,
        lean: true,
        ...paginateOptions,
        ...pagination,
      },
    );
    return notifications;
  }

  async copy(supplierId) {
    // const notifications = await this.notificationModel.find({
    //   supplierId,
    // });
    const notifications = [
      {
        attachments: [],
        channels: ['Whatsapp'],
        orderType: 'Pickup',
        content:
          'اهلاً يا {{CustomerName}}\n' +
          ' لقد استلمنا طلبك رقم # {{OrderNumber}} بنجاح.\n' +
          'شكراً على الطلب وسنتواصل معك لاحقاً\n' +
          'هذه الرسالة ارسلت لك بنيابة عن مطعم {{RestaurantName}}.\n' +
          'للتواصل مع المطعم مباشرةً على الرقم بالاسفل\n' +
          'wa.me/{{RestaurantWhatsappNumber}}',
        subject: 'تأكيد الطلب # {{OrderNumber}} ',
        events: ['Order Paid'],
        recipientTypes: ['Customer'],
        customRecipients: [],
        active: true,
        addedBy: '643b790a3ebff922bbff446f',
        __v: 0,
      },
      {
        attachments: [],
        channels: ['Whatsapp'],
        orderType: 'Pickup',
        content:
          '{{CustomerName}}\n' +
          'طلبك رقم # {{OrderNumber}} من مطعم {{RestaurantName}} جاهز للأستلام.\n' +
          'هذه الرسالة ارسلت لك بنيابة عن المطعم.\n' +
          'للتواصل مع المطعم مباشرةً على الرقم بالاسفل\n' +
          'wa.me/{{RestaurantWhatsappNumber}}',
        subject: 'طلبك جاهز # {{OrderNumber}} ',
        events: ['Done Preparing'],
        recipientTypes: ['Customer'],
        customRecipients: [],
        active: true,
        addedBy: '643b790a3ebff922bbff446f',
        __v: 0,
      },
      {
        attachments: [],
        channels: ['Sms'],
        orderType: 'Pickup',
        content:
          'اهلاً يا {{CustomerName}}\n' +
          ' لقد استلمنا طلبك رقم # {{OrderNumber}} بنجاح.\n' +
          'شكراً على الطلب وسنتواصل معك لاحقاً\n' +
          'هذه الرسالة ارسلت لك بنيابة عن مطعم {{RestaurantName}}.\n' +
          'للتواصل مع المطعم مباشرةً على الرقم بالاسفل\n' +
          'wa.me/{{RestaurantWhatsappNumber}}',
        subject: 'استلمنا طلبك # {{OrderNumber}} ',
        events: ['Order Paid'],
        recipientTypes: ['Customer'],
        customRecipients: [],
        active: false,
        addedBy: '643b790a3ebff922bbff446f',
        __v: 0,
      },
      {
        attachments: [],
        channels: ['Whatsapp'],
        orderType: 'Pickup',
        content:
          'لقد استلمت طلب جديد رقم # {{OrderNumber}}\n' +
          'تفاصيل الطلب بالاسفل\n' +
          '{{OrderSummary}}',
        subject: 'طلب جديد # {{OrderNumber}} ',
        events: ['Order Paid'],
        recipientTypes: ['Restaurant'],
        customRecipients: [],
        active: true,
        addedBy: '643b790a3ebff922bbff446f',
        __v: 0,
      },
      {
        channels: ['Email'],
        orderType: 'Pickup',
        content:
          '<p style="direction:rtl">اهلاً يا {{CustomerName}}</p>\n' +
          '\n' +
          '<p style="direction:rtl">&nbsp;لقد استلمنا طلبك رقم # {{OrderNumber}} بنجاح.</p>\n' +
          '\n' +
          '<p style="direction:rtl">شكراً على الطلب وسنتواصل معك لاحقاً.</p>\n' +
          '\n' +
          '<p style="direction:rtl">سوف تجد فاتورتك في المرفقات.</p>\n' +
          '\n' +
          '<p style="direction:rtl">&nbsp;</p>\n' +
          '\n' +
          '<p style="direction:rtl">هذه الرسالة ارسلت لك بنيابة عن مطعم {{RestaurantName}}.</p>\n' +
          '\n' +
          '<p style="direction:rtl">للتواصل مع المطعم مباشرةً على الرقم بالاسفل</p>\n' +
          '\n' +
          '<p style="direction:rtl">wa.me/{{RestaurantWhatsappNumber}}</p>',
        subject: 'الفاتورة لطلبك رقم # {{OrderNumber}} ',
        events: ['Order Paid'],
        recipientTypes: ['Customer'],
        attachments: ['Invoice'],
        customRecipients: ['aalmuwallad@gmail.com'],
        active: true,
        addedBy: '643b790a3ebff922bbff446f',
        __v: 0,
      },
      {
        channels: ['Whatsapp'],
        orderType: 'Delivery',
        content:
          'لقد استلمت طلب توصيل جديد رقم # {{OrderNumber}}\n' +
          'تفاصيل الطلب بالاسفل\n' +
          '{{OrderSummary}}',
        subject: 'طلب جديد # {{OrderNumber}} ',
        events: ['Order Paid'],
        recipientTypes: ['Restaurant'],
        attachments: [],
        customRecipients: [],
        active: true,
        addedBy: '643b790a3ebff922bbff446f',
        __v: 0,
      },
    ];

    const result = [];

    const suppliers = await this.supplierModel.find({
      _id: { $ne: supplierId },
    });
    for (const i in suppliers) {
      for (const j in notifications) {
        const notificationObj = notifications[j];
        // delete notificationObj._id;
        // delete notificationObj.createdAt;
        // delete notificationObj.updatedAt;
        // delete notificationObj.supplierId;
        const created = await this.notificationModel.create({
          supplierId: suppliers[i]._id,
          ...notificationObj,
        });
        console.log(
          `Created ${notifications[j].subject} for ${suppliers[i].name}`,
        );
      }
    }
  }

  async findOne(notificationId: string): Promise<NotificationDocument> {
    const exists = await this.notificationModel.findById(notificationId);

    if (!exists) {
      throw new NotFoundException();
    }

    return exists;
  }

  async update(
    notificationId: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      dto,
      {
        new: true,
      },
    );

    if (!notification) {
      throw new NotFoundException();
    }

    return notification;
  }

  async remove(notificationId: string): Promise<boolean> {
    const notification = await this.notificationModel.findByIdAndDelete(
      notificationId,
    );

    if (!notification) {
      throw new NotFoundException();
    }
    return true;
  }
}
