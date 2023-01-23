import { Injectable } from '@nestjs/common';
import * as enEnums from '../Constants/enum';
import * as arEnums from '../Constants/enum.ar';
import { IEnum, IEnumValue } from '../Constants/interface';
import { Logger } from '@nestjs/common';

@Injectable()
export class EnumService {
  constructor(private logger: Logger) {}

  async find(items: string[]): Promise<IEnum[]> {
    const enumDocuments: Array<IEnum> = [];

    // 1: loop over the all english enum

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
