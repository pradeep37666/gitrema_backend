import { Injectable } from '@nestjs/common';
import * as ActivityEnEnum from 'src/activity/enum/activity.enum';
import * as ImportEnEnum from 'src/import/enum/import.enum';
import * as OfferEnEnum from 'src/offer/enum/en.enum';
import * as OfferArEnum from 'src/offer/enum/ar.enum';
import * as PaymentEnEnum from 'src/payment/enum/en.enum';
import * as PaymentArEnum from 'src/payment/enum/ar.enum';
import * as SocketEnEnum from 'src/socket-io/enum/events.enum';
import * as CoreEngEnum from 'src/core/Constants/enum';
import * as CoreArEnum from 'src/core/Constants/enum.ar';
import * as ClientFeedbackEnEnum from 'src/client-feedback/enum/en.enum';
import * as ClientFeedbackArEnum from 'src/client-feedback/enum/ar.enum';
import * as MenuEnEnum from 'src/menu/enum/en.enum';
import * as MenuArEnum from 'src/menu/enum/ar.enum';
import * as OrderEnEnum from 'src/order/enum/en.enum';
import * as OrderArEnum from 'src/order/enum/ar.enum';
import * as PaymentSetupEnEnum from 'src/payment-setup/enum/en.enum';
import * as PaymentSetupArEnum from 'src/payment-setup/enum/ar.enum';
import * as QrCodeEnEnum from 'src/qr-code/enum/en.enum';
import * as QrCodeArEnum from 'src/qr-code/enum/ar.enum';
import * as TableEnEnum from 'src/table/enum/en.enum';
import * as TableArEnum from 'src/table/enum/ar.enum';
import * as NotificationEnEnum from 'src/notification/enum/en.enum';
import * as NotificationArEnum from 'src/notification/enum/ar.enum';
import { IEnum, IEnumValue } from 'src/core/Constants/interface';
import { Logger } from '@nestjs/common';

@Injectable()
export class EnumService {
  constructor(private logger: Logger) {}

  async find(items: string[]): Promise<IEnum[]> {
    const enumDocuments: Array<IEnum> = [];

    // 1: loop over the all english enum
    const enEnums = {
      ...CoreEngEnum,
      ...ClientFeedbackEnEnum,
      ...MenuEnEnum,
      ...OrderEnEnum,
      ...PaymentEnEnum,
      ...QrCodeEnEnum,
      ...TableEnEnum,
      ...ActivityEnEnum,
      ...ImportEnEnum,
      ...OfferEnEnum,
      ...SocketEnEnum,
      ...PaymentSetupEnEnum,
      ...NotificationEnEnum,
    };
    const arEnums = {
      ...CoreArEnum,
      ...ClientFeedbackArEnum,
      ...MenuArEnum,
      ...OrderArEnum,
      ...PaymentArEnum,
      ...QrCodeArEnum,
      ...TableArEnum,
      ...PaymentSetupArEnum,
      ...OfferArEnum,
      ...NotificationArEnum,
    };
    for (const item of items) {
      const doc: IEnum = { name: item };
      const values: Array<IEnumValue> = [];

      if (enEnums[item]) {
        // 4: loop over all the key of the enum and set key value
        for (const key of Object.keys(enEnums[item])) {
          values.push({ key });
        }

        // 5: loop over all the value of the enum and set en value
        for (const [index, value] of Object.values(enEnums[item]).entries()) {
          values[index] = {
            ...values[index],
            ...{ en: value.toString(), ar: '' },
          };
        }
      }

      doc.values = values;

      enumDocuments.push(doc);
    }

    // 6: loop over all the arabic enum values

    for (const item of items) {
      // 7: find the enum value in english enums
      const index = enumDocuments.findIndex((doc) => doc.name === item);

      const data = enumDocuments[index];

      if (arEnums[item]) {
        //9: loop over the each enum of arabic key
        for (const key of Object.keys(arEnums[item])) {
          const valueIndex = data.values.findIndex((doc) => doc.key === key);

          //10: if enum of arabic key is not found throw error
          if (valueIndex === -1) {
            this.logger.error(`${item} arabic enum of key ${key} not found`);
            continue;
          }

          //11: set the arabic value in the
          enumDocuments[index]['values'][valueIndex] = {
            ...enumDocuments[index]['values'][valueIndex],
            ...{ ar: arEnums[item][key] },
          };
        }
      }
    }

    return enumDocuments;
  }
}
