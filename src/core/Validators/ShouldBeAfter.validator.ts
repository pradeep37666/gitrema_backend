import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ShouldBeAfter', async: true })
@Injectable()
export class ShouldBeAfterConstraint implements ValidatorConstraintInterface {
  async validate(date: Date, validationArguments?: ValidationArguments) {
    const [relatedPropertyName] = validationArguments.constraints;
    const relatedValue = (
      validationArguments.object as Record<string, unknown>
    )[relatedPropertyName] as Date;

    if (relatedValue) {
      return date.getTime() >= relatedValue.getTime();
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ] as Date;

    if (relatedValue) {
      return `${args.property} should be After ${relatedPropertyName}.`;
    }

    return `${relatedPropertyName} should be defined`;
  }
}

export function ShouldBeAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ShouldBeAfter',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ShouldBeAfterConstraint,
      constraints: [property],
    });
  };
}
