import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ImportService } from './import.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesFastifyInterceptor, diskStorage } from 'fastify-file-interceptor';
import { editFileName, importFilter } from 'src/core/Helpers/file-upload-utils';
import { MultipleFileDto } from 'src/file-uploader/files.dto';
import { ImportDto } from './dto/import.dto';

@Controller('import')
@ApiTags('Imports')
@ApiBearerAuth('access-token')
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
  async file(
    @Req() req: any,
    @UploadedFiles() file: Express.Multer.File,
    @Body() dto: ImportDto,
  ) {
    console.log(dto);

    const fileUrls = await this.importService.import(req, dto, file);

    return fileUrls;
  }
}
