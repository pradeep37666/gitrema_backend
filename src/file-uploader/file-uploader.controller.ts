import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Req,
  UploadedFiles,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { FileUploaderService } from './file-uploader.service';

import { FilesFastifyInterceptor, diskStorage } from 'fastify-file-interceptor';
import { MultipleFileDto } from './files.dto';
import {
  editFileName,
  idFileFilter,
  imageFileFilter,
  videoFileFilter,
  zipFilter,
} from 'src/core/Helpers/file-upload-utils';
import { SkipInterceptor } from 'src/core/decorators/skip-interceptor.decorator';

@ApiTags('Common')
@Controller('file-uploader')
@ApiBearerAuth('access-token')
export class FileUploaderController {
  constructor(private readonly fileUploaderService: FileUploaderService) {}

  @ApiConsumes('multipart/form-data')
  @Post('images')
  @UseInterceptors(
    FilesFastifyInterceptor('files', 10, {
      storage: diskStorage({
        destination: './upload/',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async images(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: MultipleFileDto,
  ) {
    const fileRequest = { ...body, type: 'images' };
    const fileUrls = await this.fileUploaderService.upload(
      req,
      fileRequest,
      files,
    );

    return fileUrls;
  }

  @ApiConsumes('multipart/form-data')
  @Post('images/bulk')
  @UseInterceptors(
    FilesFastifyInterceptor('files', 1, {
      storage: diskStorage({
        destination: './upload/',
        filename: editFileName,
      }),
      fileFilter: zipFilter,
    }),
  )
  @Header('Content-Type', 'application/xlsx')
  @Header('Content-Disposition', 'attachment; filename="images.xlsx"')
  @SkipInterceptor()
  async bulkUpload(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File,
    @Body() body: MultipleFileDto,
  ) {
    const fileRequest = { ...body, type: 'images' };
    const fileStream = await this.fileUploaderService.handleZip(
      req,
      fileRequest,
      files,
    );

    return new StreamableFile(fileStream);
  }

  // @ApiConsumes('multipart/form-data')
  // @Post('videos')
  // @UseInterceptors(
  //   FilesFastifyInterceptor('files', 10, {
  //     storage: diskStorage({
  //       destination: './upload/',
  //       filename: editFileName,
  //     }),
  //     fileFilter: videoFileFilter,
  //   }),
  // )
  // async videos(
  //   @Req() req: any,
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body() body: MultipleFileDto,
  // ) {
  //   const fileRequest = { ...body, type: 'videos' };
  //   const fileUrls = await this.fileUploaderService.upload(
  //     req,
  //     fileRequest,
  //     files,
  //   );

  //   return fileUrls;
  // }

  // @ApiConsumes('multipart/form-data')
  // @Post('ids')
  // @UseInterceptors(
  //   FilesFastifyInterceptor('files', 10, {
  //     storage: diskStorage({
  //       destination: './upload/',
  //       filename: editFileName,
  //     }),
  //     fileFilter: idFileFilter,
  //   }),
  // )
  async ids(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: MultipleFileDto,
  ) {
    const fileRequest = { ...body, type: 'ids' };
    const fileUrls = await this.fileUploaderService.upload(
      req,
      fileRequest,
      files,
    );

    return fileUrls;
  }
}
