import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PublishService } from './publish.service';
import { PublishDto } from './dto/publish.dto';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { Permission } from 'src/core/Constants/permission.type';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';

@Controller('publish')
@ApiTags('Publish')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class PublishController {
  constructor(private readonly publishService: PublishService) {}

  @Post()
  @PermissionGuard(PermissionSubject.Restricted, Permission.Restricted.Publish)
  pusblish(@Body() dto: PublishDto) {
    return this.publishService.publish(dto);
  }
}
