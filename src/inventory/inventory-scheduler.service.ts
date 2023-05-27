import {
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { Inventory, InventoryDocument } from './schemas/inventory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateResult } from 'mongoose';

import { UnitOfMeasureHelperService } from 'src/unit-of-measure/unit-of-measure-helper.service';
import {
  RestaurantMaterial,
  RestaurantMaterialDocument,
} from 'src/material/schemas/restaurant-material.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Restaurant,
  RestaurantDocument,
} from 'src/restaurant/schemas/restaurant.schema';
import {
  Material,
  MaterialDocument,
} from 'src/material/schemas/material.schema';
import { MailService } from 'src/notification/mail/mail.service';
import { GlobalConfigService } from 'src/global-config/global-config.service';
import {
  LOW_INVENTORY_NOTIFICATION_TIME,
  TIMEZONE,
} from 'src/core/Constants/system.constant';
import * as moment from 'moment';
import {
  LowInventory,
  LowInventoryDocument,
} from './schemas/low-inventory.schema';

@Injectable()
export class InventorySchedulerService {
  constructor(
    @InjectModel(Inventory.name)
    private readonly inventoryModel: Model<InventoryDocument>,
    @InjectModel(RestaurantMaterial.name)
    private readonly restaurantMaterialModel: Model<RestaurantMaterialDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Material.name)
    private readonly materialModel: Model<MaterialDocument>,
    @InjectModel(LowInventory.name)
    private readonly lowInventoryModel: Model<LowInventoryDocument>,
    @Inject(forwardRef(() => UnitOfMeasureHelperService))
    private readonly unitOfMeasureHelperService: UnitOfMeasureHelperService,
    private readonly mailService: MailService,
    private readonly globalConfigService: GlobalConfigService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendMinimumQuantityNotification() {
    console.log(
      '######### Low Inventory Notification Started at ' + new Date(),
    );
    const globalConfig = await this.globalConfigService.fetch();
    console.log(globalConfig);
    let executeTimeArr = LOW_INVENTORY_NOTIFICATION_TIME.split(':');

    if (globalConfig && globalConfig.lowInventoryNotificationTime) {
      executeTimeArr = globalConfig.lowInventoryNotificationTime.split(':');
    }
    const executeTime = moment()
      .tz(TIMEZONE)
      .set({
        hour: executeTimeArr.length == 2 ? parseInt(executeTimeArr[0]) : 0,
        minute: executeTimeArr.length == 2 ? parseInt(executeTimeArr[1]) : 0,
      });
    const currentTime = moment().tz(TIMEZONE);
    let lastExecutedDay = -1;
    if (globalConfig?.lastLowInventoryNotificationSentAt) {
      const lastSent = moment(
        globalConfig?.lastLowInventoryNotificationSentAt,
      ).tz(TIMEZONE);
      lastExecutedDay = lastSent.day();
    }
    console.log(currentTime, executeTime, lastExecutedDay);
    if (
      currentTime.isSameOrAfter(executeTime) &&
      currentTime.day() != lastExecutedDay
    ) {
      const inventories = await this.restaurantMaterialModel.aggregate([
        {
          $lookup: {
            from: 'inventories',
            let: {
              restaurantId: '$restaurantId',
              materialId: '$materialId',
              minStockLevel: '$minStockLevel',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ['$restaurantId', '$$restaurantId'],
                  },
                },
              },
              {
                $match: {
                  $expr: {
                    $eq: ['$materialId', '$$materialId'],
                  },
                },
              },
              {
                $match: {
                  $or: [
                    {
                      $expr: {
                        $lte: ['$stock', '$$minStockLevel'],
                      },
                    },
                    {
                      $expr: {
                        $eq: [
                          moment.utc().format('Y-m-d'),
                          {
                            $dateToString: {
                              date: '$expirationDate',
                              format: '%Y-%m-%d',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            as: 'inventory',
          },
        },
        {
          $match: {
            inventory: {
              $ne: [],
            },
          },
        },
      ]);
      let restaurants = await this.restaurantModel.find({
        _id: {
          $in: inventories.map((i) => {
            return i.restaurantId;
          }),
        },
      });
      restaurants = restaurants.reduce((acc, d) => {
        acc[d._id.toString()] = d;
        return acc;
      }, []);

      let materials = await this.materialModel.find({
        _id: {
          $in: inventories.map((i) => {
            return i.materialId;
          }),
        },
      });
      materials = materials.reduce((acc, d) => {
        acc[d._id.toString()] = d;
        return acc;
      }, []);
      const outOfStockMaterials = [];
      for (const i in inventories) {
        if (!outOfStockMaterials[inventories[i].restaurantId.toString()]) {
          outOfStockMaterials[inventories[i].restaurantId.toString()] = {
            materials: [],
            email: restaurants[inventories[i].restaurantId.toString()].email,
            restaurantId: inventories[i].restaurantId,
            supplierId: inventories[i].supplierId,
          };
        }
        outOfStockMaterials[
          inventories[i].restaurantId.toString()
        ].materials.push({
          //material: materials[inventories[i].materialId.toString()],
          materialId: inventories[i].materialId,
          materialName: materials[inventories[i].materialId.toString()]?.name,
          materialNameAr:
            materials[inventories[i].materialId.toString()]?.nameAr,
          onHand: inventories[i].inventory[0].stock,
          minimumStockLevel: inventories[i].minStockLevel,
          expirationDate: inventories[i].inventory[0].expirationDate,
        });
      }
      for (const i in outOfStockMaterials) {
        // let html = `<table>
        //               <tr>
        //                 <th>Material</th>
        //                 <th>On Hand</th>
        //                 <th>Minimum Stock Level</th>
        //               </tr>
        //             `;
        // for (const j in outOfStockMaterials[i].materials) {
        //   html += `<tr>
        //             <td>${outOfStockMaterials[i].materials[j].material.name}</td>
        //             <td>${outOfStockMaterials[i].materials[j].onHand}</td>
        //             <td>${outOfStockMaterials[i].materials[j].minimumStockLevel}</td>
        //           </tr>
        //           `;
        // }
        // html += `<\table>`;
        // if (outOfStockMaterials[i].email)
        //   this.mailService.send({
        //     to: outOfStockMaterials[i].email,
        //     subject: 'Low Inventory',
        //     body: html,
        //   });
        await this.lowInventoryModel.create(outOfStockMaterials[i]);
      }
      this.globalConfigService.create(null, {
        lastLowInventoryNotificationSentAt: new Date(),
      });
    }
    console.log(
      '######### Low Inventory Notification Completed at ' + new Date(),
    );
  }
}
