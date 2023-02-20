import { PartialType } from '@nestjs/swagger';
import { CreateScreenDisplayDto } from './create-screen-display.dto';

export class UpdateScreenDisplayDto extends PartialType(CreateScreenDisplayDto) {}
