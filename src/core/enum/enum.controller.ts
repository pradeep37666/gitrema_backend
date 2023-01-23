import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { IEnum } from '../Constants/interface';
import { EnumDto } from './enum.dto';
import { EnumService } from './enum.service';

@ApiTags('Enum')
@ApiBearerAuth('access-token')
@Controller('enum')
export class EnumController {
  constructor(private readonly enumService: EnumService) {}

  /**
   *
   * @returns find
   * @description API get array of enum
   */

  @Get('')
  @Public()
  async find(@Query() items: EnumDto): Promise<IEnum[]> {
    const enums = items.enums.split(',');
    return this.enumService.find(enums);
  }
}
