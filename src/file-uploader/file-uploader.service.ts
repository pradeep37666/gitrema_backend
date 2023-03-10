import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { S3Service } from 'src/core/Providers/Storage/S3.service';
import { CompressService } from './compress.service';
import * as extract from 'extract-zip';
import * as fs from 'fs';
import * as path from 'path';
import { Workbook } from 'exceljs';
import * as tmp from 'tmp';

import { getFiles, reduce } from 'src/core/Helpers/universal.helper';

@Injectable()
export class FileUploaderService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly compressService: CompressService,
  ) {}

  async upload(
    req: any,
    fileRequest: any,
    files: Express.Multer.File[],
  ): Promise<any> {
    const fileUrls = [];
    const directory = this.prepareDirectoryName(req, fileRequest);
    for (const i in files) {
      const compressedPath = await this.compressService.compressImage(
        files[i].path,
      );
      const res = await this.s3Service.uploadLocalFile(
        compressedPath,
        directory,
      );
      if (res) {
        fileUrls[i] = res.Location;
      }
    }
    return fileUrls;
  }

  async handleZip(req: any, fileRequest: any, file: Express.Multer.File) {
    file = file[0];
    const directory = this.prepareDirectoryName(req, fileRequest);
    const randomName = Array(8)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const zipDir = `./upload/${randomName}/`;

    await extract(file.path, { dir: path.resolve(`${zipDir}`) });

    const toArray = (iter) => reduce(iter, (a, x) => (a.push(x), a), []);

    const files = await toArray(getFiles(zipDir));

    const book = new Workbook();
    const sheet = book.addWorksheet('Images');
    const records = [];
    for (const i in files) {
      const filePath = files[i];
      const compressedPath = await this.compressService.compressImage(filePath);
      const res = await this.s3Service.uploadLocalFile(
        compressedPath,
        directory,
      );
      const pathToStore = directory + path.basename(compressedPath);
      records.push([
        path.basename(filePath),
        res ? res.Location : 'Error Uploading file to s3',
      ]);
    }
    sheet.addRows(records);
    const tmpFile = tmp.fileSync({
      mode: 0o644,
    });
    await book.xlsx.writeFile(tmpFile.name);
    console.log(tmpFile);
    fs.unlink(file.path, (err) => {
      console.log(err);
    });

    fs.rmSync(zipDir, { recursive: true, force: true });

    return fs.createReadStream(tmpFile.name);
  }

  prepareDirectoryName(req, fileRequest): string {
    let directory = '';
    if (req.user.supplierId) {
      directory += req.user.supplierId + '/';
    }

    return directory + fileRequest.type + '/';
  }
}
