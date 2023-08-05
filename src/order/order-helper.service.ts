import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
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
import {
  InvoiceStatus,
  OrderActivityType,
  OrderPaymentStatus,
  OrderStatus,
  OrderType,
  PreparationStatus,
} from './enum/en.enum';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { CalculationType } from 'src/core/Constants/enum';
import { roundOffNumber } from 'src/core/Helpers/universal.helper';
import { Offer, OfferDocument } from 'src/offer/schemas/offer.schema';
import * as moment from 'moment';
import { CreateOrderDto } from './dto/create-order.dto';
import { ActivitySubject, ActivityType } from 'src/activity/enum/activity.enum';
import { CreateActivityDto } from 'src/activity/dto/create-activity.dto';
import { ApplicationType } from 'src/offer/enum/en.enum';
import { TableLog, TableLogDocument } from 'src/table/schemas/table-log.schema';
import { Cart, CartDocument, CartItem } from './schemas/cart.schema';
import { CalculationService } from './calculation.service';
import { TableStatus } from 'src/table/enum/en.enum';
import { Table } from 'src/table/schemas/table.schema';
import { TableDocument } from 'src/table/schemas/table.schema';
import { SocketIoGateway } from 'src/socket-io/socket-io.gateway';
import { SocketEvents } from 'src/socket-io/enum/events.enum';
import { TableHelperService } from 'src/table/table-helper.service';
import {
  Customer,
  CustomerDocument,
} from 'src/customer/schemas/customer.schema';
import { WhatsappService } from 'src/core/Providers/http-caller/whatsapp.service';
import { OrderNotificationService } from './order-notification.service';
import { CustomerService } from 'src/customer/customer.service';
import { OrderEvents } from 'src/notification/enum/en.enum';
import { DeliveryService } from 'src/delivery/delivery.service';
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';
import { InventoryHelperService } from 'src/inventory/inventory-helper.service';
import { OrderService } from './order.service';
import { PrinterType } from 'src/printer/enum/en';
import { InvoiceHelperService } from 'src/invoice/invoice-helper.service';
import { KitchenQueueProcessDto } from './dto/kitchen-queue-process.dto';
import { TableLogService } from 'src/table/table-log.service';

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
    @InjectModel(TableLog.name)
    private readonly tableLogModel: Model<TableLogDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @Inject(forwardRef(() => CalculationService))
    private readonly calculationService: CalculationService,
    private socketGateway: SocketIoGateway,
    private readonly tableHelperService: TableHelperService,
    private readonly orderNotificationService: OrderNotificationService,
    private readonly customerService: CustomerService,
    private readonly deliveryService: DeliveryService,
    private readonly inventoryHelperService: InventoryHelperService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => InvoiceHelperService))
    private readonly invoiceHelperService: InvoiceHelperService,
  ) {}

  async prepareOrderItems(dto: CreateOrderDto | UpdateOrderDto | any) {
    const preparedItems = [];
    const taxRate = dto.taxRate;
    const items = dto.items;

    console.log(items);

    //fetch all menu items
    const menuItemIds = items.map((oi) => oi.menuItem.menuItemId);
    const menuItems = await this.menuItemModel
      .find({
        _id: { $in: menuItemIds },
        active: true,
        deletedAt: null,
      })
      .populate([{ path: 'categoryId' }])
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
        unitPriceDiscount = 0,
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
          `${VALIDATION_MESSAGES.MenuItemNotAvailable.key}__${items[i].menuItem.menuItemId}`,
        );

      // check if the items is soldout
      if (menuItem.soldOut)
        throw new BadRequestException(
          `${VALIDATION_MESSAGES.SoldOut.key}__${menuItem.name}`,
        );

      // check the quantity
      if (menuItem.manageQuantity) {
        const availableQuantities = menuItem.quantities.find((q) => {
          return q.restaurantId.toString() == dto.restaurantId;
        });
        if (
          !availableQuantities ||
          availableQuantities.quantity < items[i].quantity
        )
          throw new BadRequestException(
            `${VALIDATION_MESSAGES.SoldOut.key}__${menuItem.name}`,
          );
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
          applicationType: ApplicationType.LineItem,
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
            applicationType: [
              ApplicationType.LineItem,
              ApplicationType.ManagerLineItem,
            ],
          },
          {},
          { sort: { priority: 1 } },
        );

        if (
          offer &&
          offer.maxNumberAllowed &&
          offer.maxNumberAllowed <= offer.totalUsed
        )
          offer = null;
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
        unitPriceDiscount =
          discount /
          (offer.applicationType == ApplicationType.ManagerLineItem
            ? items[i].quantity
            : 1);
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
          return ma._id.toString() == additions[j].menuAdditionId.toString();
        });
        preparedAdditions[j] = {
          ...additions[j],
          ...menuAddition,
        };
        if (additions[j].options) {
          // only set the selected options
          const additionOptionIds = additions[j].options.map((ao) =>
            ao.optionId.toString(),
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

      preparedItems[i].preparationTime = roundOffNumber(
        preparedItems[i].menuItem.preparationTime * preparedItems[i].quantity,
      );
      preparedItems[i].kitchenQueueId =
        menuItem.categoryId.kitchenQueueId ?? dto.kitchenQueueId ?? null;
    }

    return preparedItems;
  }

  async postOrderCreate(req, order: OrderDocument) {
    // commenting the  schedule activities
    // if (order.isScheduled)
    //   this.calculationService.identifyOrdersToRecalculateForScheduled(order);
    // store activity

    // notify for new pickup or delivery order
    if ([OrderType.Delivery, OrderType.Pickup].includes(order.orderType)) {
      this.socketGateway.emit(
        order.supplierId.toString(),
        SocketEvents.OrderCreated,
        order.toObject(),
      );
    }

    if (!order.isGrouped)
      // manage inventory
      this.manageInventory(order);

    if (req.user.isCustomer) {
      const customer = await this.customerModel.findById(req.user.userId);
      if (customer) {
        order.customerId = customer._id;
        order.contactNumber = customer.phoneNumber;
        order.name = customer.name;
        order.save();

        if (order.orderType == OrderType.Delivery) {
          customer.deliveryAddress = order.deliveryAddress;
          customer.save();
        }
      }
    }

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

    // notify customer
    this.orderNotificationService.triggerOrderNotification(
      OrderEvents.OrderCreated,
      order,
    );

    // increment coupon usage
    if (order.couponCode) this.postCouponUsage(order.couponCode);
    //auto assign waiter and kitchen queue
    // if (order.orderType == OrderType.DineIn) {
    // }
    // update the table log
    if (order.tableId) {
      const tableLog =
        await this.tableHelperService.addOrderToTableLogWithAutoStart(order);
    }
  }

  async postOrderUpdate(
    order: OrderDocument,
    dto: UpdateOrderDto,
    beforeUpdate: OrderDocument = null,
  ) {
    // store activity
    if (dto.status) {
      if (dto.status == OrderStatus.SentToKitchen) {
        this.storeOrderStateActivity(
          order,
          OrderActivityType.SentToKitchen,
          order.sentToKitchenTime,
        );
        if (!order.isScheduled) {
          order.preparationDetails =
            await this.calculationService.calculateOrderPreparationTiming(
              order,
              OrderStatus.SentToKitchen,
            );
          await order.save();
          this.calculationService.identifyOrdersToRecalculateAfterSentToKitchen(
            order,
          );
        } else {
          // commenting the  schedule activities
          // this.calculationService.identifyOrdersToRecalculateForScheduled(
          //   order,
          //   OrderStatus.SentToKitchen,
          // );
        }
        // generate kitchen receipt
        this.generateKitchenReceipts(order);
        this.notifyKitchenQueue(order);
      } else if (dto.status == OrderStatus.OnTable) {
        this.storeOrderStateActivity(
          order,
          OrderActivityType.OrderReady,
          order.orderReadyTime,
        );
        if (order.tableId) {
          this.tableHelperService.handleReadyFlag(order);
        }
      } else if (
        dto.status == OrderStatus.Cancelled ||
        dto.status == OrderStatus.CancelledWihPaymentFailed ||
        dto.status == OrderStatus.CancelledByMerge
      ) {
        // this.storeOrderStateActivity(
        //   order,
        //   OrderActivityType.OrderReady,
        //   order.orderReadyTime,
        // );
        if (order.orderType == OrderType.Delivery)
          this.deliveryService.cancel(order._id.toString());
        this.calculationService.identifyOrdersToRecalculateAfterCompleted(
          order,
        );
        if (order.invoiceStatus == InvoiceStatus.Invoiced) {
          await this.invoiceHelperService.regenerateInvoice(order, true);
        }
      } else {
        // check if needs to recalculate the order timing
        if ([OrderStatus.New, OrderStatus.SentToKitchen].includes(order.status))
          this.calculationService.handleOrderPreparationAfterUpdate(order);
      }
      this.orderNotificationService.triggerOrderNotification(dto.status, order);
      //this.orderNotificationService.triggerOrderNotification(order);
    }

    if (dto.tableId) {
      this.tableHelperService.handleTableTransfer(order, beforeUpdate.tableId);
    }

    if (!order.customerId && order.contactNumber) {
      this.setCustomer(order);
    }

    if (dto.items || dto.couponCode) {
      this.invoiceHelperService.regenerateInvoice(order);
    }

    if (dto.items) {
      this.generateKitchenReceipts(order, false);
    }
  }

  async setCustomer(order: OrderDocument) {
    const customer = await this.customerService.findByPhoneNumber(
      order.contactNumber,
    );
    if (customer) {
      order.customerId = customer._id;
      order.save();
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
      // this.inventoryHelperService.handlePostSale({
      //   restaurantId: order.restaurantId.toString(),
      //   menuItemId: menuItem._id.toString(),
      //   quantitiesSold: items[i].quantity,
      //   entity: order,
      //   price: items[i].unitPriceAfterDiscount,
      //   paymentStatus: order.paymentStatus,
      // });
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

  async generateOrderNumber(supplierId: string): Promise<string> {
    const order = await this.orderModel.findOne(
      { supplierId },
      {},
      { sort: { _id: -1 } },
    );
    let n = 1;
    if (order) {
      n = parseInt(order.orderNumber) + 1;
    }

    //return String(n).padStart(7, '0');
    return n.toString();
  }

  async storeCart(orderData) {
    const cartItems = [];
    orderData.items.forEach((oi) => {
      const additions = [];
      oi.additions.forEach((oia) => {
        additions.push({
          menuAdditionId: oia.menuAdditionId,
          options: oia.options.map((o) => o.optionId),
        });
      });
      cartItems.push({
        menuItemId: oi.menuItem.menuItemId,
        additions,
      });
    });
    await this.cartModel.create({
      cartItems,
    });
  }

  async postKitchenQueueProcessing(
    order: OrderDocument,
    dto: KitchenQueueProcessDto,
  ) {
    if (dto.preparationStatus == PreparationStatus.DonePreparing) {
      const dataToNotify = {
        type: 'Item',
        data: null,
      };
      const modifiedOrder = await this.orderModel.findById(order._id);
      if (
        modifiedOrder.items.length ==
        modifiedOrder.items.filter((oi) => {
          return oi.preparationStatus == dto.preparationStatus;
        }).length
      ) {
        modifiedOrder.status = OrderStatus.DonePreparing;
        modifiedOrder.preparationDetails.actualEndTime = new Date();
        const orderBeforeModified = modifiedOrder;
        await modifiedOrder.save();
        this.postOrderUpdate(
          order,
          { status: OrderStatus.DonePreparing },
          orderBeforeModified,
        );
        this.calculationService.identifyOrdersToRecalculateAfterCompleted(
          modifiedOrder,
        );
        dataToNotify.data = modifiedOrder.toObject();
        dataToNotify.type = 'Order';
      } else {
        dataToNotify.data = order.items.find(
          (oi) => oi._id.toString() == dto.orderItemId,
        );
      }
      // update table log
      if (order.tableId) {
        this.tableHelperService.handleReadyFlag(order);
      }
      // notify customer
      this.orderNotificationService.triggerOrderNotification(
        OrderEvents.DonePreparing,
        order,
      );
      //console.log(`Socket Event ${}`);
      this.socketGateway.emit(
        order.supplierId.toString(),
        SocketEvents.OrderPrepared,
        dataToNotify,
      );
    }
  }
  async generateKitchenReceipts(order: OrderDocument, print = true) {
    const printersDetails: any = await this.orderService.identifyPrinters(
      { user: { supplierId: order.supplierId } },
      {
        orderId: order._id.toString(),
        printerType: PrinterType.Kitchen,
      },
      order,
      true,
    );
    console.log(printersDetails);
    if (printersDetails.printers.length > 0) {
      order.kitchenReceipts =
        await this.invoiceHelperService.generateKitchenReceipt(
          order,
          printersDetails,
          print,
        );
      order.save();
      //console.log(order);
    }
  }
  async notifyKitchenQueue(order: OrderDocument) {
    let kitchenQueues = order.items.map((oi) => oi.kitchenQueueId);
    for (const i in kitchenQueues) {
      if (kitchenQueues[i]) {
        this.socketGateway.emit(
          order.supplierId.toString(),
          SocketEvents.KitchenQueue,
          { KitchenQueueId: kitchenQueues[i], orderListRefresh: true },
        );
      }
    }
  }

  
}
