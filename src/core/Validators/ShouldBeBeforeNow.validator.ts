import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ShouldBeBeforeNow', async: true })
@Injectable()
export class ShouldBeBeforeNowConstraint
  implements ValidatorConstraintInterface
{
  async validate(date: Date) {
    return Date.now() >= date.getTime();
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should be Before Now.`;
  }
}

export function ShouldBeBeforeNow(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ShouldBeBeforeNow',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ShouldBeBeforeNowConstraint,
    });
  };
}
