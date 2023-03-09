import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { S3Service } from 'src/core/Providers/Storage/S3.service';
import * as fs from 'fs';

@Injectable()
export class CompressService {
  constructor(private readonly s3Service: S3Service) {}

  async compressImage(file) {
    const name = file.originalname.split('.')[0];

    const randomName = Array(8)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const image = sharp(file.path);
    // const meta = await image.metadata();
    // console.log(meta);
    await image
      .webp({ quality: 50 })
      .toFile(`./upload/${name}-${randomName}.webp`);
    fs.unlink(file.path, (err) => {
      console.log(err);
    });
    return `./upload/${name}-${randomName}.webp`;
  }
}
