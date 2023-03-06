import { Request } from 'express';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { STATUS_MSG } from '../Constants/status-message.constants';

export const editFileName = (
  req: Request,
  file: Express.Multer.File,
  callback,
) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(8)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    //throw new BadRequestException(STATUS_MSG.ERROR.ONLY_IMAGES_ALLOWED);
    callback(
      new BadRequestException(STATUS_MSG.ERROR.ONLY_IMAGES_ALLOWED),
      false,
    );
  }
  callback(null, true);
};

export const importFilter = (
  req: Request,
  file: Express.Multer.File,
  callback,
) => {
  if (!file.originalname.match(/\.(xlsx|xls)$/)) {
    callback(new BadRequestException(`Only xlsx and xls are allowed`), false);
  }
  callback(null, true);
};

export const videoFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback,
) => {
  if (!file.originalname.match(/\.(mp4|avi|mov)$/)) {
    return callback(
      new BadRequestException(STATUS_MSG.ERROR.ONLY_VIDEOS_ALLOWED),
      false,
    );
  }
  callback(null, true);
};

export const idFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback,
) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback(
      new BadRequestException(STATUS_MSG.ERROR.ONLY_IDS_ALLOWED),
      false,
    );
  }
  callback(null, true);
};
