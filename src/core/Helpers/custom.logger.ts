import { ConsoleLogger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

export class CustomLogger extends ConsoleLogger {
  //   constructor(
  //     @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
  //   ) {
  //     super();
  //   }
  error(message: any, stack?: string, context?: string) {
    // add your tailored logic here

    super.error(message, stack, context);
  }
}
