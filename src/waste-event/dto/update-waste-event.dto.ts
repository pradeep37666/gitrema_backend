import { PartialType } from '@nestjs/swagger';
import { CreateWasteEventDto } from './create-waste-event.dto';

export class UpdateWasteEventDto extends PartialType(CreateWasteEventDto) {}
