import { PartialType } from '@nestjs/swagger';
import { CreateVendorMaterialDto } from './create-vendor-material.dto';

export class UpdateVendorMaterialDto extends PartialType(CreateVendorMaterialDto) {}
