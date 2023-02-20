import { CreateOrderDto } from 'src/order/dto/create-order.dto';
import { OrderType, Source } from 'src/order/enum/en.enum';

export const OrderCreateWithoutAdditionStub = (): CreateOrderDto => {
  return {
    restaurantId: '63de4f65ef00e374fd708f76',
    tableId: '63e3b62b3a41da0507ae0277',
    name: 'Nur',
    contactNumber: '9415465',
    source: Source.DineIn,
    orderType: OrderType.DineIn,
    items: [
      {
        menuItem: {
          menuItemId: '63d86e295eedd5483de1fa47',
        },
        quantity: 1,
        additions: [],
        notes: '',
      },
    ],
  };
};

export const OrderCreateWithAdditionStub = (): CreateOrderDto => {
  return {
    restaurantId: '63de4f65ef00e374fd708f76',
    tableId: '63e3b62b3a41da0507ae0277',
    name: 'Nur',
    contactNumber: '9415465',
    source: Source.DineIn,
    orderType: OrderType.DineIn,
    items: [
      {
        menuItem: {
          menuItemId: '63d34169070c6883f8d3b880',
        },
        additions: [
          {
            menuAdditionId: '63d3401b070c6883f8d3b87d',
            options: [
              {
                optionId: '63d6a8075cfb101ee5c43017',
              },
            ],
          },
        ],
        quantity: 5,
        notes: 'creamy shake',
      },
    ],
  };
};
