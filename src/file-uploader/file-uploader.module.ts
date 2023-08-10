import { Module } from '@nestjs/common';

import { FileUploaderController } from './file-uploader.controller';
import { FileUploaderService } from './file-uploader.service';
import { StorageModule } from 'src/core/Providers/Storage/storage.module';
import { CompressService } from './compress.service';

@Module({
  imports: [StorageModule],
  controllers: [FileUploaderController],
  providers: [FileUploaderService, CompressService],
  exports: [CompressService],
})
export class FileUploaderModule {}
