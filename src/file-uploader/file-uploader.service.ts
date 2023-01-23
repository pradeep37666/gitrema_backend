import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { S3Service } from 'src/core/Providers/Storage/S3.service';

@Injectable()
export class FileUploaderService {
  constructor(private readonly s3Service: S3Service) {}

  async upload(
    req: any,
    fileRequest: any,
    files: Express.Multer.File[],
  ): Promise<any> {
    const fileUrls = [];
    const directory = this.prepareDirectoryName(req, fileRequest);
    for (const i in files) {
      const res = await this.s3Service.uploadFile(files[i], directory);
      if (res) {
        fileUrls[i] = res.Location;
      }
    }
    return fileUrls;
  }
  prepareDirectoryName(req, fileRequest): string {
    let directory = '';
    if (req.user.supplierId) {
      directory += req.user.supplierId + '/';
    }
    if (fileRequest.propertyId) {
      directory += fileRequest.propertyId + '/';
    }
    return directory + fileRequest.type + '/';
  }
}
