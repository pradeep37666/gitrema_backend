import { Module } from '@nestjs/common';
import { S3Service } from './S3.service';

@Module({
  providers: [S3Service],
  controllers: [],
  exports: [S3Service],
})
export class StorageModule {}
