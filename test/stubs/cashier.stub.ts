import { CreateCashierDto } from 'src/cashier/dto/create-cashier.dto';

export const CashierCreateStub = (): CreateCashierDto => {
  return {
    restaurantId: '63de4f65ef00e374fd708f76',
    name: 'Cashier Name',
    nameAr: 'Cashier Name in Ar',
  };
};
