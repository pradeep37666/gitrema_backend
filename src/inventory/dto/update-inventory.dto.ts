import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateInventoryDto } from './create-inventory.dto';

export class UpdateInventoryDto extends OmitType(
  PartialType(CreateInventoryDto),
  ['materialId', 'restaurantId'] as const,
) {}
