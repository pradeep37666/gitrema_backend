import { PartialType } from '@nestjs/swagger';
import { CreateSelectedVendorDto } from './create-selected-vendor.dto';

export class UpdateSelectedVendorDto extends PartialType(CreateSelectedVendorDto) {}
