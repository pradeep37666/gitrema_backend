import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ShouldBeBefore', async: true })
@Injectable()
export class ShouldBeBeforeConstraint implements ValidatorConstraintInterface {
  async validate(date: Date, validationArguments?: ValidationArguments) {
    const [relatedPropertyName] = validationArguments.constraints;
    const relatedValue = (
      validationArguments.object as Record<string, unknown>
    )[relatedPropertyName] as Date;

    if (relatedValue) {
      return date.getTime() <= relatedValue.getTime();
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ] as Date;

    if (relatedValue) {
      return `${args.property} should be Before ${relatedPropertyName}.`;
    }

    return `${relatedPropertyName} should be defined`;
  }
}

export function ShouldBeBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ShouldBeBefore',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: ShouldBeBeforeConstraint,
      constraints: [property],
    });
  };
}
