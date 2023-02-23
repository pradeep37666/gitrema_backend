import { Cashier } from 'src/cashier/schemas/cashier.schema';
import { KitchenQueue } from 'src/kitchen-queue/schemas/kitchen-queue.schema';
import { PaymentSetup } from 'src/payment-setup/schemas/payment-setup.schema';
import { Restaurant } from 'src/restaurant/schemas/restaurant.schema';
import { Supplier } from '../schemas/suppliers.schema';

export interface RestaurantDetailed extends Restaurant {
  kitchenqueues: KitchenQueue[];
  cashiers: Cashier[];
  totalKitchens: number;
  totalCashiers: number;
}

export interface SupplierAggregated extends Supplier {
  paymentsetups: PaymentSetup[];
  restaurants: RestaurantDetailed[];
  totalRestaurants: number;
  totalPaymentsetups: number;
}
