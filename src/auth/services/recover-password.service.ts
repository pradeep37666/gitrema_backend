import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import Handlebars from 'handlebars';
import { RecoverPasswordDto } from '../dto/recover-password.dto';

import { LeanDocument, Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import {
  ChangePasswordDto,
  RecoverPassword,
} from '../dto/changes-password.dto';

import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { STATUS_MSG } from 'src/core/Constants/status-message.constants';
import { UserService } from 'src/users/users.service';
import { User, UserDocument } from 'src/users/schemas/users.schema';

import { MailService } from 'src/notification/mail/mail.service';
import { CustomEvent } from 'src/core/Constants/enum';
import { generateRandomPassword } from 'src/core/Helpers/universal.helper';

@Injectable()
export class RecoverPasswordService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sendChangePasswordMail(
    recoverPasswordDto: RecoverPasswordDto,
  ): Promise<any> {
    const userExists = await this.userModel.findOne({
      email: recoverPasswordDto.email,
    });

    if (!userExists) {
      throw new BadRequestException(STATUS_MSG.ERROR.RECORD_NOT_FOUND);
    }

    const password = generateRandomPassword();
    userExists.password = password;
    userExists.save();

    const html = `The system has set a following temporary password on your account.
    <b>${password}</b>`;

    return this.mailService.send({
      to: recoverPasswordDto.email,
      subject: 'Temporary Password',
      body: html,
    });
  }

  async changePassword(
    req: any,
    data: ChangePasswordDto | RecoverPassword,
  ): Promise<any> {
    if (data.currentPassword) {
      const user = await this.userModel.findById(req.user.userId).lean();
      if (!(await bcrypt.compare(data.currentPassword, user.password))) {
        throw new BadRequestException(STATUS_MSG.ERROR.UNAUTHORIZED);
      }
    }

    const user = await this.userModel.findById(req.user.userId);
    user.password = data.password;
    if (!user.save()) {
      throw new ForbiddenException(STATUS_MSG.ERROR.SERVER_ERROR);
    }
    delete user.password;
    return user;
  }
}
