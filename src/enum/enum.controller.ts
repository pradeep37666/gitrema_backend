import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { Public } from '../core/decorators/public.decorator';
import { IEnum } from '../core/Constants/interface';
import { EnumDto } from './enum.dto';
import { EnumService } from './enum.service';

@ApiTags('Enum')
@ApiBearerAuth('access-token')
@Controller('enum')
@ApiHeader({ name: 'lang' })
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
