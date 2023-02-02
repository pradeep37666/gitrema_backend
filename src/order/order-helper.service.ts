import { Injectable } from '@nestjs/common';

import { UpdateOrderItemDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { OrderItemDto } from './dto/order-item.dto';
import {
  MenuAddition,
  MenuAdditionDocument,
} from 'src/menu/schemas/menu-addition.schema';
import { OrderType } from './enum/order.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { CalculationType } from 'src/core/Constants/enum';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';

@Injectable()
export class OrderHelperService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
    @InjectModel(MenuAddition.name)
    private readonly menuAdditionModel: Model<MenuAdditionDocument>,
  ) {}

  async prepareOrderItems(
    items: OrderItemDto[] | UpdateOrderItemDto[],
    supplier: LeanDocument<SupplierDocument>,
  ) {
    const preparedItems = [];
    const taxRate = supplier.taxRate ?? 15;

    //fetch all menu items
    const menuItemIds = items.map((oi) => oi.menuItem.menuItemId);
    const menuItems = await this.menuItemModel
      .find({
        _id: { $in: menuItemIds },
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

      netPrice = price = priceBeforeDiscount = menuItem.price;

      if (menuItem.discount) {
        discount =
          menuItem.discount.type == CalculationType.Fixed
            ? menuItem.discount.value
            : (menuItem.price * menuItem.discount.value) / 100;
        price -= discount;
      }
      if (menuItem.taxEnabled) {
        netPrice = roundOffNumber(price / (1 + taxRate / 100));
      }

      preparedItems[i].menuItem = {
        ...items[i].menuItem,
        ...menuItem,
        tax: roundOffNumber(price - netPrice),
      };

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

          //sum the tax of selected options
          // netPrice += preparedAdditions[j].options.reduce(
          //   (acc, ao) =>
          //     acc + ao.taxEnabled ? ao.price / (1 + taxRate / 100) : ao.price,
          //   0,
          // );
        }
      }
      preparedItems[i].additions = preparedAdditions;
      preparedItems[i].priceAfterDiscount = price;
      preparedItems[i].gross = priceBeforeDiscount;
      preparedItems[i].discount = discount;
      preparedItems[i].netPrice = roundOffNumber(netPrice);
      preparedItems[i].itemTotal = price * preparedItems[i].quantity;
      preparedItems[i].tax =
        (price - preparedItems[i].netPrice) * preparedItems[i].quantity;
    }

    return preparedItems;
  }

  async postOrderCreate(order: OrderDocument) {
    //auto assign waiter and kitchen queue
    if (order.orderType == OrderType.DineIn) {
    }
  }
}
