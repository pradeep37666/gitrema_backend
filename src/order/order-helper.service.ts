import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { UpdateOrderDto, UpdateOrderItemDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import {
  Activity,
  ActivityDocument,
} from 'src/activity/schemas/activity.schema';
import {
  MenuAddition,
  MenuAdditionDocument,
} from 'src/menu/schemas/menu-addition.schema';
import { OrderActivityType, OrderStatus, OrderType } from './enum/en.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { CalculationType } from 'src/core/Constants/enum';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Offer, OfferDocument } from 'src/offer/schemas/offer.schema';
import * as moment from 'moment';
import { CreateOrderDto } from './dto/create-order.dto';
import { ActivitySubject, ActivityType } from 'src/activity/enum/activity.enum';
import { CreateActivityDto } from 'src/activity/dto/create-activity.dto';

@Injectable()
export class OrderHelperService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuAddition.name)
    private readonly menuAdditionModel: Model<MenuAdditionDocument>,
    @InjectModel(Offer.name)
    private readonly offerModel: Model<OfferDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
  ) {}

  async prepareOrderItems(
    dto: CreateOrderDto | UpdateOrderDto,
    supplier: LeanDocument<SupplierDocument>,
    order: OrderDocument = null,
  ) {
    const preparedItems = [];
    const taxRate = supplier.taxRate ?? 15;
    const items = dto.items;

    //fetch all menu items
    const menuItemIds = items.map((oi) => oi.menuItem.menuItemId);
    const menuItems = await this.menuItemModel
      .find({
        _id: { $in: menuItemIds },
        active: true,
        deletedAt: null,
      })
      .lean();

    //fetch all menu additions
    const menuAdditionArr = items.map((oi) => oi?.additions).flat();
    const menuAdditionIds = menuAdditionArr.map((ma) => ma?.menuAdditionId);

    let menuAdditions = [];
    if (menuAdditionIds.length > 0) {
      menuAdditions = await this.menuAdditionModel
        .find({
          _id: { $in: menuAdditionIds },
        })
        .lean();
    }

    for (const i in items) {
      let price = 0,
        priceBeforeDiscount = 0,
        netPrice = 0,
        discount = 0;
      preparedItems[i] = { ...items[i] };

      // copy menu item attributes needed in order schema
      const menuItem = menuItems.find((mi) => {
        return mi._id.toString() == items[i].menuItem.menuItemId;
      });

      // check if valid menu item
      if (!menuItem)
        throw new NotFoundException(
          `${items[i].menuItem.menuItemId} is not available`,
        );

      // check if the items is soldout
      if (menuItem.soldOut)
        throw new BadRequestException(`${menuItem.name} is sold out`);

      // check the quantity
      if (menuItem.manageQuantity) {
        const availableQuantities = menuItem.quantities.find((q) => {
          return q.restaurantId.toString() == dto.restaurantId;
        });
        if (
          !availableQuantities ||
          availableQuantities.quantity < items[i].quantity
        )
          throw new BadRequestException(`${menuItem.name} is sold out`);
      }

      // calculate price
      netPrice = price = priceBeforeDiscount = menuItem.price;

      // apply promotion
      discount = 0;
      const offer = await this.offerModel.findOne(
        {
          $or: [
            { menuCategoryIds: menuItem.categoryId },
            { menuItemIds: menuItem._id },
          ],
          active: true,
          deletedAt: null,
          start: {
            $lte: new Date(moment.utc().format('YYYY-MM-DD')),
          },
          end: {
            $gte: new Date(moment.utc().format('YYYY-MM-DD')),
          },
        },
        {},
        { sort: { priority: 1 } },
      );
      if (offer) {
        discount =
          offer.discountType == CalculationType.Fixed
            ? offer.discount
            : roundOffNumber((menuItem.price * offer.discount) / 100);
        discount = offer.maxDiscount
          ? discount > offer.maxDiscount
            ? offer.maxDiscount
            : discount
          : discount;
        price -= discount;
        netPrice = price;
      }

      // apply tax
      if (menuItem.taxEnabled) {
        netPrice = roundOffNumber(price / (1 + taxRate / 100));
      }
      preparedItems[i].menuItem = {
        ...items[i].menuItem,
        ...menuItem,
        tax: roundOffNumber(price - netPrice),
      };

      //prepare additions
      const preparedAdditions = [];
      const additions = items[i].additions ?? [];
      // copy menu addition attributes needed in order schema
      for (const j in additions) {
        const menuAddition = menuAdditions.find((ma) => {
          return ma._id.toString() == additions[j].menuAdditionId;
        });
        preparedAdditions[j] = {
          ...additions[j],
          ...menuAddition,
        };
        if (additions[j].options) {
          // only set the selected options
          const additionOptionIds = additions[j].options.map(
            (ao) => ao.optionId,
          );
          preparedAdditions[j].options = menuAddition.options.filter((mao) => {
            return additionOptionIds.includes(mao._id.toString());
          });

          // sum the price of selected options
          const additionPrice = preparedAdditions[j].options.reduce(
            (acc, ao) => acc + ao.price,
            0,
          );

          price += additionPrice;
          priceBeforeDiscount += additionPrice;

          // storing tax for each option and calculating net price
          preparedAdditions[j].options.forEach((o) => {
            o.optionId = o._id;
            const optionNetPrice = o.taxEnabled
              ? o.price / (1 + taxRate / 100)
              : o.price;
            o.tax = roundOffNumber(o.price - optionNetPrice);
            netPrice += optionNetPrice;
          });
        }
      }
      preparedItems[i].additions = preparedAdditions;
      preparedItems[i].priceAfterDiscount = price;
      preparedItems[i].gross = priceBeforeDiscount;
      preparedItems[i].discount = discount;
      preparedItems[i].netPrice = roundOffNumber(netPrice);
      preparedItems[i].itemTotal = price * preparedItems[i].quantity;
      preparedItems[i].tax = roundOffNumber(
        (price - preparedItems[i].netPrice) * preparedItems[i].quantity,
      );
    }

    return preparedItems;
  }

  async postOrderCreate(order: OrderDocument) {
    // store activity
    if (order.sittingStartTime)
      this.storeOrderStateActivity(
        order,
        OrderActivityType.SittingStart,
        order.sittingStartTime,
      );
    if (order.menuQrCodeScannedTime)
      this.storeOrderStateActivity(
        order,
        OrderActivityType.MenuScanned,
        order.menuQrCodeScannedTime,
      );
    this.storeOrderStateActivity(
      order,
      OrderActivityType.OrderPlaced,
      order.createdAt,
    );

    // manage inventory
    this.manageInventory(order);

    // increment coupon usage
    if (order.couponCode) this.postCouponUsage(order.couponCode);
    //auto assign waiter and kitchen queue
    // if (order.orderType == OrderType.DineIn) {
    // }
  }

  async postOrderUpdate(order: OrderDocument, dto: UpdateOrderDto) {
    // store activity
    if (dto.status && dto.status == OrderStatus.Processing) {
      this.storeOrderStateActivity(
        order,
        OrderActivityType.SentToKitchen,
        order.sentToKitchenTime,
      );
    } else if (dto.status && dto.status == OrderStatus.OnTable) {
      this.storeOrderStateActivity(
        order,
        OrderActivityType.orderReady,
        order.orderReadyTime,
      );
    }
  }

  async manageInventory(order: OrderDocument) {
    const items = order.items;
    const menuItemIds = items.map((oi) => oi.menuItem.menuItemId);
    const menuItems = await this.menuItemModel.find({
      _id: { $in: menuItemIds },
      active: true,
      deletedAt: null,
    });
    for (const i in items) {
      const menuItem = menuItems.find((mi) => {
        return mi._id.toString() == items[i].menuItem.menuItemId;
      });
      if (menuItem && menuItem.manageQuantity) {
        const index = menuItem.quantities.findIndex(
          (obj) => obj.restaurantId.toString() == order.restaurantId.toString(),
        );
        menuItem.quantities[index].quantity -= items[i].quantity;
        if (menuItem.quantities[index].quantity == 0) menuItem.soldOut = true;
        menuItem.save();
      }
    }
  }

  async postCouponUsage(couponCode) {
    await this.offerModel.findOneAndUpdate(
      { code: couponCode },
      { $inc: { totalUsed: 1 } },
    );
  }

  async storeOrderStateActivity(
    order: OrderDocument,
    activityType: OrderActivityType,
    date,
  ) {
    const activityDetails: CreateActivityDto = {
      dataId: order._id,
      subject: ActivitySubject.Order,
      type: ActivityType.OrderState,
      data: { date, activityType },
    };

    await this.activityModel.create({
      ...activityDetails,
      supplierId: order.supplierId,
    });
  }
}
