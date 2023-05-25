import { InventoryDirection } from '../enum/en';

export interface CalculatedInventory {
  stock: number;
  averageCost: number;
  stockValue: number;
  conversionFactor: number;
  sourceItemWithBase?: {
    stock?: number;
    cost?: number;
    stockValue?: number;
  };
  direction: InventoryDirection;
}
