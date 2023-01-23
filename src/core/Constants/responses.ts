import { HttpException, HttpStatus } from '@nestjs/common';
import { Messages } from './constants';

export const alreadyExists = (msg: string) => {
  throw new HttpException(
    {
      status: HttpStatus.CONFLICT,
      message: Messages.EMAIL_EXISTS,
    },
    HttpStatus.CONFLICT,
  );
};
