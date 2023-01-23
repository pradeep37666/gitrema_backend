import { Module } from '@nestjs/common';

import { FileUploaderController } from './file-uploader.controller';
import { FileUploaderService } from './file-uploader.service';
import { StorageModule } from 'src/core/Providers/Storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [FileUploaderController],
  providers: [FileUploaderService],
})
export class FileUploaderModule {}
