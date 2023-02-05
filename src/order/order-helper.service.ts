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
      let discount = 0,
        unitPriceBeforeDiscount = 0,
        unitPriceDiscount,
        unitPriceAfterDiscount = 0,
        itemTaxableAmount = 0,
        tax = 0;
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
      unitPriceBeforeDiscount = menuItem.price;

      // apply promotion / couponcode
      discount = 0;
      let offer = await this.offerModel.findOne(
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
      if (!offer && dto.couponCode) {
        offer = await this.offerModel.findOne(
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
            code: dto.couponCode,
          },
          {},
          { sort: { priority: 1 } },
        );
        if (offer.maxNumberAllowed > offer.totalUsed) offer = null;
      }
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
        unitPriceDiscount = discount;
      }
      unitPriceAfterDiscount = unitPriceBeforeDiscount - unitPriceDiscount;

      itemTaxableAmount = unitPriceAfterDiscount * items[i].quantity;

      // apply tax
      if (menuItem.taxEnabled) {
        itemTaxableAmount = roundOffNumber(
          itemTaxableAmount / (1 + taxRate / 100),
        );
        tax = (itemTaxableAmount * taxRate) / 100;
      }
      preparedItems[i].menuItem = {
        ...items[i].menuItem,
        ...menuItem,
        unitPriceBeforeDiscount: roundOffNumber(unitPriceBeforeDiscount),
        //quantity: items[i].quantity,
        amountBeforeDiscount: roundOffNumber(
          unitPriceBeforeDiscount * items[i].quantity,
        ),
        unitPriceDiscount: roundOffNumber(unitPriceDiscount),
        discount: roundOffNumber(unitPriceDiscount * items[i].quantity),
        unitPriceAfterDiscount: roundOffNumber(unitPriceAfterDiscount),
        amountAfterDiscount: roundOffNumber(
          unitPriceAfterDiscount * items[i].quantity,
        ),
        itemTaxableAmount: roundOffNumber(itemTaxableAmount),
        tax: roundOffNumber(tax),
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

          // storing tax,price details for each option and calculating net price
          preparedAdditions[j].options.forEach((o) => {
            o.optionId = o._id;
            const option = {
              discount: 0,
              unitPriceDiscount: 0,
              unitPriceBeforeDiscount: 0,
              itemTaxableAmount: 0,
              tax: 0,
            };

            // calculate for each option
            option.unitPriceBeforeDiscount = o.price;
            option.itemTaxableAmount =
              option.unitPriceBeforeDiscount * items[i].quantity;
            if (menuAddition.taxEnabled) {
              option.itemTaxableAmount =
                option.itemTaxableAmount / (1 + taxRate / 100);
              option.tax = (option.itemTaxableAmount * taxRate) / 100;
            }

            // set in option obj of DB
            o.unitPriceBeforeDiscount = roundOffNumber(
              option.unitPriceBeforeDiscount,
            );
            o.amountBeforeDiscount = roundOffNumber(
              option.unitPriceBeforeDiscount * items[i].quantity,
            );
            o.unitPriceDiscount = 0;
            o.discount = 0;
            o.unitPriceAfterDiscount = o.unitPriceBeforeDiscount;
            o.amountAfterDiscount = o.amountBeforeDiscount;
            o.itemTaxableAmount = roundOffNumber(option.itemTaxableAmount);
            o.tax = roundOffNumber(option.tax);

            // add option price to item
            unitPriceBeforeDiscount += option.unitPriceBeforeDiscount;
            unitPriceAfterDiscount += option.unitPriceBeforeDiscount;
            itemTaxableAmount += option.itemTaxableAmount;
            tax += option.tax;
          });
        }
      }
      // set for each order item in database
      preparedItems[i].additions = preparedAdditions;
      preparedItems[i].unitPriceBeforeDiscount = roundOffNumber(
        unitPriceBeforeDiscount,
      );
      preparedItems[i].amountBeforeDiscount = roundOffNumber(
        unitPriceBeforeDiscount * preparedItems[i].quantity,
      );
      preparedItems[i].unitPriceDiscount = roundOffNumber(unitPriceDiscount);
      preparedItems[i].discount = roundOffNumber(
        unitPriceDiscount * preparedItems[i].quantity,
      );
      preparedItems[i].unitPriceAfterDiscount = roundOffNumber(
        unitPriceAfterDiscount,
      );

      preparedItems[i].amountAfterDiscount = roundOffNumber(
        unitPriceAfterDiscount * preparedItems[i].quantity,
      );
      preparedItems[i].itemTaxableAmount = roundOffNumber(itemTaxableAmount);

      preparedItems[i].tax = roundOffNumber(tax);
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
        OrderActivityType.OrderReady,
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
