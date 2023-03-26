import { Injectable } from '@nestjs/common';
import { CashierService } from 'src/cashier/cashier.service';
import { CreateCashierDto } from 'src/cashier/dto/create-cashier.dto';
import { CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { ListType } from 'src/core/Constants/enum';
import { CreateInvoiceDto } from 'src/invoice/dto/create-invoice.dto';
import { InvoiceType } from 'src/invoice/invoice.enum';
import { InvoiceService } from 'src/invoice/invoice.service';
import { CreateKitchenQueueDto } from 'src/kitchen-queue/dto/create-kitchen-queue.dto';
import { KitchenQueueService } from 'src/kitchen-queue/kitchen-queue.service';
import { KitchenQueueDocument } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { CreateListDto } from 'src/list/dto/create-list.dto';
import { ListService } from 'src/list/list.service';
import { CreateMenuCategoryDTO } from 'src/menu/dto/menu-category.dto';
import { CreateMenuItemDTO } from 'src/menu/dto/menu-item.dto';
import { MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { MenuCategoryService } from 'src/menu/service/menu-category.service';
import { MenuItemService } from 'src/menu/service/menu-item.service';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { OrderType, Source } from 'src/order/enum/en.enum';
import { OrderService } from 'src/order/order.service';
import { OrderDocument } from 'src/order/schemas/order.schema';
import { CreatePaymentSetupDto } from 'src/payment-setup/dto/create-payment-setup.dto';
import { PaymentSetupService } from 'src/payment-setup/payment-setup.service';
import { PaymentInitiateDto } from 'src/payment/dto/payment.dto';
import { PaymentMethod } from 'src/payment/enum/en.enum';
import { PaymentService } from 'src/payment/payment.service';
import { CreateRestaurantDto } from 'src/restaurant/dto/create-restaurant.dto';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { RestaurantDocument } from 'src/restaurant/schemas/restaurant.schema';
import { SupplierDocument } from 'src/supplier/schemas/suppliers.schema';
import { CreateTableDto } from 'src/table/dto/create-table.dto';
import { TableDocument } from 'src/table/schemas/table.schema';
import { TableService } from 'src/table/table.service';

@Injectable()
export class TestDataService {
  constructor(
    private readonly restaurantService: RestaurantService,
    private readonly tableService: TableService,
    private readonly listService: ListService,
    private readonly cashierService: CashierService,
    private readonly kitchenQueueService: KitchenQueueService,
    private readonly menuCategoryService: MenuCategoryService,
    private readonly menuItemService: MenuItemService,
    private readonly orderService: OrderService,
    private readonly paymentService: PaymentService,
    private readonly paymentSetupService: PaymentSetupService,
    private readonly invoiceService: InvoiceService,
  ) {}
  async run(req: any, supplier: SupplierDocument) {
    req.user.supplierId = supplier._id;
    await this.paymentSetup(req, supplier);

    const restaurant = await this.createRestaurant(req, supplier);

    const table = await this.createTable(req, restaurant);

    const cashier = await this.createCashier(req, restaurant);

    const kitchenQueue = await this.createKitchenQueue(req, restaurant);

    const menuItem = await this.createMenu(req);

    const order = await this.createOrder(
      req,
      restaurant,
      table,
      kitchenQueue,
      menuItem,
    );
    await this.takePayment(req, order, cashier);

    const invoice = await this.createInvioice(req, order);

    return true;
  }

  async createRestaurant(req, supplier: SupplierDocument) {
    const dto: CreateRestaurantDto = {
      name: supplier.name,
      nameAr: supplier.nameAr,
      city: 'Abha',
      whatsappNumber: '',
      enableWhatsappCommunication: true,
      beforeConfirmOrderMessage: { en: 'Thank you', ar: 'Thank you' },
      defaultWorkingHours: supplier.defaultWorkingHours,
      overrideWorkingHours: supplier.overrideWorkingHours,
      isMenuBrowsingEnabled: true,
      isAppOrderEnabled: true,
      isDeliveryEnabled: true,
      isPickupOrderEnabled: true,
      isScheduledOrderEnabled: true,
      isReservationEnabled: true,
      isWaitingEnabled: true,
      minimumDeliveryOrderValue: 10,
      isDeliveryToCarEnabled: true,
    };
    const restaurant = await this.restaurantService.create(req, dto);
    return restaurant;
  }

  async paymentSetup(req, supplier: SupplierDocument) {
    const dto: CreatePaymentSetupDto = {
      inStore: {
        ePayment: true,
        cashPayment: true,
        rewardsClaim: true,
      },
      delivery: {
        ePayment: true,
        cashPayment: true,
        rewardsClaim: true,
      },
      pickup: {
        ePayment: true,
        cashPayment: true,
        rewardsClaim: true,
      },
    };
    await this.paymentSetupService.create(req, dto);
  }

  async createTable(req, restaurant: RestaurantDocument) {
    const tableRegionDto: CreateListDto = {
      type: ListType.TableRegion,
      name: 'Default Region',
      nameAr: 'Default Region',
    };
    const tableRegion = await this.listService.create(req, tableRegionDto);
    const dto: CreateTableDto = {
      restaurantId: restaurant._id,
      tableRegionId: tableRegion._id,
      name: 'Default Table',
      nameAr: 'Default Table',
      totalChairs: 4,
    };

    const table = await this.tableService.create(req, dto);
    return table;
  }

  async createCashier(req, restaurant: RestaurantDocument) {
    const dto: CreateCashierDto = {
      restaurantId: restaurant._id,
      name: 'Default Cashier',
      nameAr: 'Default Cashier',
    };
    const cashier = await this.cashierService.create(req, dto);
    return cashier;
  }

  async createKitchenQueue(req, restaurant: RestaurantDocument) {
    const dto: CreateKitchenQueueDto = {
      restaurantId: restaurant._id,
      name: 'Default Cashier',
      nameAr: 'Default Cashier',
      userId: req.user.userId,
    };
    const kitchenQueue = await this.kitchenQueueService.create(req, dto);
    return kitchenQueue;
  }

  async createMenu(req) {
    const menuCategoryDto: CreateMenuCategoryDTO = {
      name: 'Default Category',
      nameAr: 'Default Category',
      order: 1,
    };
    const menuCategory = await this.menuCategoryService.create(
      req,
      menuCategoryDto,
    );

    const menuItemDto: CreateMenuItemDTO = {
      categoryId: menuCategory._id,
      name: 'Default Menu Item',
      nameAr: 'Default Menu Item',
      price: 10,
      calories: 10,
      order: 1,
      preparationTime: 10,
    };

    const menuItem = await this.menuItemService.create(req, menuItemDto);
    return menuItem;
  }

  async createOrder(
    req,
    restaurant: RestaurantDocument,
    table: TableDocument,
    kitchenQueue: KitchenQueueDocument,
    menuItem: MenuItemDocument,
  ) {
    const dto: CreateOrderDto = {
      restaurantId: restaurant._id,
      tableId: table._id,
      kitchenQueueId: kitchenQueue._id,
      source: Source.DineIn,
      name: 'Customer 1',
      contactNumber: '1234567890',
      orderType: OrderType.DineIn,
      items: [
        {
          menuItem: {
            menuItemId: menuItem._id,
          },
          quantity: 5,
          notes: 'Make it spicy',
        },
      ],
    };
    const order = await this.orderService.create(req, dto);
    return order;
  }

  async takePayment(req, order: OrderDocument, cashier: CashierDocument) {
    const dto: PaymentInitiateDto = {
      orderId: order._id,
      paymentMethod: PaymentMethod.Cash,
      cashierId: cashier._id,
    };
    await this.paymentService.create(req, dto);
  }

  async createInvioice(req, order: OrderDocument) {
    const dto: CreateInvoiceDto = {
      orderId: order._id,
      type: InvoiceType.Invoice,
    };
    const invoice = await this.invoiceService.create(req, dto);
    return invoice;
  }
}
