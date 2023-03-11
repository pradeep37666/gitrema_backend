import { Injectable, Req, Res } from '@nestjs/common';
import S3 = require('aws-sdk/clients/s3');
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import path = require('path');
import mime = require('mime-types');

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}
  AWS_S3_BUCKET = this.configService.get('aws.AWS_S3_BUCKET');
  s3 = new S3({
    accessKeyId: this.configService.get('aws.AWS_S3_ACCESS_KEY'),
    secretAccessKey: this.configService.get('aws.AWS_S3_KEY_SECRET'),
  });

  async uploadFile(file, directory) {
    const { filename } = file;
    const fileBuffer = fs.readFileSync(file.path);
    return await this.s3_upload(
      fileBuffer,
      this.AWS_S3_BUCKET,
      directory + filename,
      file.mimetype,
      file.path,
    );
  }

  async uploadLocalFile(filePath, directory) {
    const fileBuffer = fs.readFileSync(filePath);
    return await this.s3_upload(
      fileBuffer,
      this.AWS_S3_BUCKET,
      directory + path.basename(filePath),
      mime.lookup(filePath),
      filePath,
    );
  }

  async s3_upload(fileBuffer, bucket, name, mimetype, filePath) {
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: fileBuffer,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };
    try {
      const s3Response = await this.s3.upload(params).promise();
      console.log(filePath);
      fs.unlink(filePath, (err) => {
        console.log(err);
      });
      if (s3Response && s3Response.Location) {
        s3Response.Location = s3Response.Location.replace(
          this.configService.get('aws.AWS_S3_URL'),
          this.configService.get('aws.AWS_S3_CF_URL'),
        );
      }
      return s3Response;
    } catch (e) {
      console.log(e);
      // fs.unlink(filePath, (err) => {
      //   console.log(err);
      // });
      return false;
    }
  }
}
