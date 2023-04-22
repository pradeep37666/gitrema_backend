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
import { VALIDATION_MESSAGES } from 'src/core/Constants/validation-message';

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
      throw new BadRequestException(VALIDATION_MESSAGES.RecordNotFound.key);
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
        throw new BadRequestException(VALIDATION_MESSAGES.Unauthorised.key);
      }
    }

    const user = await this.userModel.findById(req.user.userId);
    user.password = data.password;
    if (!user.save()) {
      throw new ForbiddenException(VALIDATION_MESSAGES.ServerError.key);
    }
    delete user.password;
    return user;
  }
}
