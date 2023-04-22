import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ImportService } from './import.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import { FilesFastifyInterceptor, diskStorage } from 'fastify-file-interceptor';
import { editFileName, importFilter } from 'src/core/Helpers/file-upload-utils';
import { MultipleFileDto } from 'src/file-uploader/files.dto';
import { ImportDto } from './dto/import.dto';
import { PermissionGuard } from 'src/core/decorators/permission.decorator';
import { PermissionSubject } from 'src/core/Constants/permissions/permissions.enum';
import { Permission } from 'src/core/Constants/permission.type';

@Controller('import')
@ApiTags('Imports')
@ApiBearerAuth('access-token')
@ApiHeader({ name: 'lang' })
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @ApiConsumes('multipart/form-data')
  @Post('')
  @UseInterceptors(
    FilesFastifyInterceptor('file', 1, {
      storage: diskStorage({
        destination: './upload/',
        filename: editFileName,
      }),
      fileFilter: importFilter,
    }),
  )
  // @PermissionGuard(PermissionSubject.Import, Permission.Common.CREATE)
  async file(
    @Req() req: any,
    @UploadedFiles() file: Express.Multer.File,
    @Body() dto: ImportDto,
  ) {
    return await this.importService.import(req, dto, file);
  }

  @Get(':importId')
  // @PermissionGuard(PermissionSubject.Import, Permission.Common.FETCH)
  async findOne(@Param('importId') importId: string) {
    return await this.importService.findOne(importId);
  }
}
