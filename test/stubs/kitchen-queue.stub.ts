import { CreateKitchenQueueDto } from 'src/kitchen-queue/dto/create-kitchen-queue.dto';

export const KithchenQueueCreateStub = (): CreateKitchenQueueDto => {
  return {
    restaurantId: '63de4f65ef00e374fd708f76',
    name: 'Kitchen Queue Name in En',
    nameAr: 'Kitchen Queue Name in Ar',
    userId: '63de4f65ef00e374fd708f76',
  };
};
