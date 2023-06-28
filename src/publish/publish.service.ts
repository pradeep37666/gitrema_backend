import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PublishDto } from './dto/publish.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Supplier,
  SupplierDocument,
} from 'src/supplier/schemas/suppliers.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { User, UserDocument } from 'src/users/schemas/users.schema';
import { Role, RoleDocument } from 'src/role/schemas/roles.schema';
import { RoleSlug } from 'src/core/Constants/enum';
import {
  Restaurant,
  RestaurantDocument,
} from 'src/restaurant/schemas/restaurant.schema';
import {
  MenuCategory,
  MenuCategoryDocument,
} from 'src/menu/schemas/menu-category.schema';
import {
  MenuAddition,
  MenuAdditionDocument,
} from 'src/menu/schemas/menu-addition.schema';
import { MenuItem, MenuItemDocument } from 'src/menu/schemas/menu-item.schema';
import { Cashier, CashierDocument } from 'src/cashier/schemas/cashier.schema';
import { Printer, PrinterDocument } from 'src/printer/schema/printer.schema';
import { Table, TableDocument } from 'src/table/schemas/table.schema';
import {
  KitchenQueue,
  KitchenQueueDocument,
} from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import {
  PaymentGateway,
  PaymentGatewayDocument,
} from 'src/payment-gateway/schema/payment-gateway.schema';
import {
  PaymentSetup,
  PaymentSetupDocument,
} from 'src/payment-setup/schemas/payment-setup.schema';
import { List, ListDocument } from 'src/list/schemas/list.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PublishService {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<SupplierDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>,
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
    @InjectModel(MenuCategory.name)
    private menuCategoryModel: Model<MenuCategoryDocument>,
    @InjectModel(MenuAddition.name)
    private menuAdditionModel: Model<MenuAdditionDocument>,
    @InjectModel(MenuItem.name)
    private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(Cashier.name)
    private cashierModel: Model<CashierDocument>,
    @InjectModel(Printer.name)
    private printerModel: Model<PrinterDocument>,
    @InjectModel(Table.name)
    private tableModel: Model<TableDocument>,
    @InjectModel(KitchenQueue.name)
    private kitchenQueueModel: Model<KitchenQueueDocument>,
    @InjectModel(PaymentGateway.name)
    private paymentGatewayModel: Model<PaymentGatewayDocument>,
    @InjectModel(PaymentSetup.name)
    private paymentSetupModel: Model<PaymentSetupDocument>,
    @InjectModel(List.name)
    private listModel: Model<ListDocument>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}
  private readonly prodUrl = 'https://apimenu.talabatmenu.com';
  private readonly superAdminAccessToken = this.configService.get(
    'app.superAdminToken',
  );
  public supplierAdminAccessToken = '';
  public restaurants = {};
  public categories = {};
  public additions = {};
  public printers = {};
  public list = {};
  public kitchenQueues = {};
  public errors = [];
  async publish(dto: PublishDto) {
    console.log('----------------Creating Supplier----------------');
    const supplier = await this.createSupplier(dto.supplierId);
    console.log('----------------Supplier Created----------------');

    console.log('----------------Impersoinating Supplier----------------');
    await this.impersonateSupplier(supplier);
    console.log('----------------Supplier Impersonated----------------');

    console.log('----------------Creating Supplier Admin----------------');
    await this.createSupplierAdmin(dto.supplierId, supplier);
    console.log('----------------Supplier Admin Created----------------');

    console.log('----------------Creating List----------------');
    await this.createList(dto.supplierId);
    console.log('----------------List Created----------------');

    console.log('----------------Creating Printers----------------');
    await this.createPrinters(dto.supplierId);
    console.log('----------------Printers Created----------------');

    console.log('----------------Creating Restaurants----------------');
    await this.createRestaurants(dto.supplierId);
    console.log('----------------Restaurants Created----------------');

    console.log('----------------Creating Kitchen Queues----------------');
    await this.createKitchenQueues(dto.supplierId);
    console.log('----------------Kitchen Queues Created----------------');

    console.log('----------------Creating Tables----------------');
    await this.createTables(dto.supplierId);
    console.log('----------------Tables Created----------------');

    console.log('----------------Creating Cashiers----------------');
    await this.createCashiers(dto.supplierId);
    console.log('----------------cashiers Created----------------');

    console.log('----------------Creating Menu Categories----------------');
    await this.createMenuCategory(dto.supplierId);
    console.log('----------------Menu Categories Created----------------');

    console.log('----------------Creating Menu additions----------------');
    await this.createMenuAddition(dto.supplierId);
    console.log('----------------Menu additions Created----------------');

    console.log('----------------Creating Menu Items----------------');
    await this.createMenuItem(dto.supplierId);
    console.log('----------------Menu Items Created----------------');

    console.log('----------------Creating Payment Gateways----------------');
    await this.createPaymentGateways(dto.supplierId, supplier);
    console.log('----------------Payment Gateways Created----------------');

    console.log('----------------Creating Payment Setups----------------');
    await this.createPaymentSetups(dto.supplierId);
    console.log('----------------Payment Setups Created----------------');
    return this.errors;
  }

  async createSupplier(supplierId: string) {
    const supplier = await this.supplierModel.findById(supplierId);
    if (!supplier) {
      throw new NotFoundException();
    }
    const supplierObj = supplier.toObject();
    supplierObj.whatsapp = supplierObj.whatsapp ?? '';
    const response = await lastValueFrom(
      this.httpService
        .post(
          `${this.prodUrl}/supplier`,
          {
            ...supplierObj,
          },
          {
            headers: {
              Authorization: `Bearer ${this.superAdminAccessToken}`,
            },
          },
        )
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );
    console.log(response, response?.data);
    if (response && response.data) return response.data;
    console.log(response);
    throw new BadRequestException(`Not able create supplier on prod`);
  }
  async impersonateSupplier(prodSupplier: SupplierDocument) {
    const response = await lastValueFrom(
      this.httpService
        .post(
          `${this.prodUrl}/users/impersonate-supplier`,
          {
            supplierId: prodSupplier._id.toString(),
          },
          {
            headers: {
              Authorization: `Bearer ${this.superAdminAccessToken}`,
            },
          },
        )
        .pipe(map((resp) => resp.data))
        .pipe(
          catchError((e) => {
            throw new BadRequestException(e);
          }),
        ),
    );
    //  console.log(response, response?.data);
    if (response && response.data) {
      this.supplierAdminAccessToken = response.data;
      return;
    }
    throw new BadRequestException(`Not able to impersonate supplier on prod`);
  }
  async createSupplierAdmin(
    supplierId: string,
    prodSupplier: SupplierDocument,
  ) {
    try {
      const role = await this.roleModel.findOne({
        slug: RoleSlug.SupplierAdmin,
      });
      const user = await this.userModel.findOne({
        supplierId,
        role: role._id,
      });
      const userObj = user.toObject();

      const response = await lastValueFrom(
        this.httpService
          .post(
            `${this.prodUrl}/users`,
            {
              ...userObj,
            },
            {
              headers: {
                Authorization: `Bearer ${this.supplierAdminAccessToken}`,
              },
            },
          )
          .pipe(map((resp) => resp.data))
          .pipe(
            catchError((e) => {
              throw new BadRequestException(e);
            }),
          ),
      );
      console.log(response);
      if (response && response.data) return response.data;
    } catch (err) {
      this.errors.push(`Failed to create user on prod`);
    }
  }
  async createRestaurants(supplierId: string) {
    const restaurants = await this.restaurantModel.find({
      supplierId,
    });
    for (const i in restaurants) {
      try {
        const restaurantObj = restaurants[i].toObject();
        console.log(`Creating Restaurant - ${restaurants[i]._id}`);
        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/restaurant`,
              {
                ...restaurantObj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
        if (response && response.data) {
          this.restaurants[restaurants[i]._id.toString()] = response.data;
        }
        console.log(`Created Restaurant - ${restaurants[i]._id}`);
      } catch (err) {
        this.errors.push(
          `Failed to create restaurant ${restaurants[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }
  async createMenuCategory(supplierId: string) {
    const categories = await this.menuCategoryModel.find({ supplierId });
    for (const i in categories) {
      try {
        const obj = categories[i].toObject();
        obj.printerId =
          this.printers[obj.printerId?.toString()]?._id?.toString() ?? null;
        obj.kitchenQueueId =
          this.kitchenQueues[obj.kitchenQueueId?.toString()]?._id?.toString() ??
          null;
        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/menu-category`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
        if (response && response.data) {
          this.categories[categories[i]._id.toString()] = response.data;
        }
      } catch (err) {
        this.errors.push(
          `Failed to create Menu Categoy ${categories[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }
  async createMenuAddition(supplierId: string) {
    const additions = await this.menuAdditionModel.find({ supplierId });
    for (const i in additions) {
      try {
        const obj = additions[i].toObject();

        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/menu-addition`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
        if (response && response.data) {
          this.additions[additions[i]._id.toString()] = response.data;
        }
      } catch (err) {
        this.errors.push(
          `Failed to create Menu addition ${additions[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }
  async createMenuItem(supplierId: string) {
    const items = await this.menuItemModel.find({ supplierId });
    for (const i in items) {
      try {
        const obj = items[i].toObject();
        const additions = [];
        items[i].additions.forEach((addition) => {
          if (this.additions[addition.toString()]?._id)
            additions.push(
              this.additions[addition.toString()]?._id?.toString(),
            );
        });
        obj.additions = additions;
        obj.categoryId =
          this.categories[obj.categoryId?.toString()]?._id?.toString() ?? null;
        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/menu-item`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
      } catch (err) {
        this.errors.push(
          `Failed to create Menu Item ${items[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }

  async createPrinters(supplierId: string) {
    const printers = await this.printerModel.find({ supplierId });
    for (const i in printers) {
      try {
        const obj = printers[i].toObject();

        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/printer`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
        if (response && response.data) {
          this.printers[printers[i]._id.toString()] = response.data;
        }
      } catch (err) {
        this.errors.push(
          `Failed to create Printer ${printers[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }

  async createCashiers(supplierId: string) {
    const cashiers = await this.cashierModel.find({ supplierId });
    for (const i in cashiers) {
      try {
        const obj = cashiers[i].toObject();

        obj.restaurantId =
          this.restaurants[obj.restaurantId?.toString()]?._id?.toString() ??
          null;
        obj.printerId =
          this.printers[obj.printerId?.toString()]?._id?.toString() ?? null;
        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/cashier`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
      } catch (err) {
        this.errors.push(
          `Failed to create Cashier ${cashiers[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }

  async createTables(supplierId: string) {
    const tables = await this.tableModel.find({ supplierId });
    for (const i in tables) {
      try {
        const obj = tables[i].toObject();

        obj.restaurantId =
          this.restaurants[obj.restaurantId?.toString()]?._id?.toString() ??
          null;
        obj.tableRegionId =
          this.list[obj.tableRegionId?.toString()]?._id?.toString() ?? null;
        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/table`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
      } catch (err) {
        this.errors.push(
          `Failed to create Table ${tables[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }
  async createList(supplierId: string) {
    const list = await this.listModel.find({ supplierId });
    for (const i in list) {
      try {
        const obj = list[i].toObject();

        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/list`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
        if (response && response.data) {
          this.list[list[i]._id.toString()] = response.data;
        }
      } catch (err) {
        this.errors.push(
          `Failed to create List ${list[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }

  async createKitchenQueues(supplierId: string) {
    const records = await this.kitchenQueueModel.find({ supplierId });
    for (const i in records) {
      try {
        const obj = records[i].toObject();
        obj.restaurantId =
          this.restaurants[obj.restaurantId?.toString()]?._id?.toString() ??
          null;
        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/kitchen-queue`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
        if (response && response.data) {
          this.kitchenQueues[records[i]._id.toString()] = response.data;
        }
      } catch (err) {
        this.errors.push(
          `Failed to create Kitchen Queue ${records[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }
  async createPaymentGateways(
    supplierId: string,
    prodSupplier: SupplierDocument,
  ) {
    const records = await this.paymentGatewayModel.find({ supplierId });
    for (const i in records) {
      try {
        const obj = records[i].toObject();
        obj.supplierId = prodSupplier._id.toString();
        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/payment-gateway`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.superAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
      } catch (err) {
        this.errors.push(
          `Failed to create Payment Gateway ${records[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }
  async createPaymentSetups(supplierId: string) {
    const records = await this.paymentSetupModel.find({ supplierId });
    for (const i in records) {
      try {
        const obj = records[i].toObject();

        const response = await lastValueFrom(
          this.httpService
            .post(
              `${this.prodUrl}/payment-setup`,
              {
                ...obj,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.supplierAdminAccessToken}`,
                },
              },
            )
            .pipe(map((resp) => resp.data))
            .pipe(
              catchError((e) => {
                throw new BadRequestException(e);
              }),
            ),
        );
      } catch (err) {
        this.errors.push(
          `Failed to create Payment Setup ${records[i]._id} (Dev  ID) on prod`,
        );
      }
    }
  }
}
