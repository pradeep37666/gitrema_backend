import { Injectable } from '@nestjs/common';

import { UpdateOrderItemDto } from './dto/update-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { OrderItemDto } from './dto/order-item.dto';
import {
  MenuAddition,
  MenuAdditionDocument,
} from 'src/menu/schemas/menu-addition.schema';
import { OrderType } from './enum/order.enum';

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

  async prepareOrderItems(items: OrderItemDto[] | UpdateOrderItemDto[]) {
    const preparedItems = [];

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
      let tax = 0,
        price = 0;
      preparedItems[i] = { ...items[i] };
      // copy menu item attributes needed in order schema
      const menuItem = menuItems.find((mi) => {
        return mi._id.toString() == items[i].menuItem.menuItemId;
      });
      preparedItems[i].menuItem = {
        ...items[i].menuItem,
        ...menuItem,
      };
      price += menuItem.price;
      tax += menuItem.tax ?? 0;

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

          preparedAdditions[j].options.forEach((o) => {
            o.optionId = o._id;
          });

          // sum the price of selected options
          price += preparedAdditions[j].options.reduce(
            (acc, ao) => acc + ao.price,
            0,
          );
          //sum the tax of selected options
          tax += preparedAdditions[j].options.reduce(
            (acc, ao) => acc + (ao.tax ?? 0),
            0,
          );
        }
      }
      preparedItems[i].additions = preparedAdditions;
      preparedItems[i].price = price;
      preparedItems[i].itemTotal = price * preparedItems[i].quantity;
      preparedItems[i].tax = tax;
    }

    return preparedItems;
  }

  async postOrderCreate(order: OrderDocument) {
    //auto assign waiter and kitchen queue
    if (order.orderType == OrderType.DineIn) {
    }
  }
}
