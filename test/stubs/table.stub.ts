import { CreateTableDto } from 'src/table/dto/create-table.dto';
import { Shape } from 'src/table/enum/en.enum';

export const TableCreateStub = (): CreateTableDto => {
  return {
    tableRegionId: '63de4f65ef00e374fd708f76',
    restaurantId: '63de4f65ef00e374fd708f76',
    name: 'Table 1',
    nameAr: 'Ar Table 1',
    totalChairs: 4,
    fees: 10,
    minimumOrderValue: 10,
    minutesAllowed: 30,
    shape: Shape.Circle,
  };
};
