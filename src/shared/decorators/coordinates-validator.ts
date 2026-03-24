import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsLatitude(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidLatitude',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'number' && value >= -90 && value <= 90;
        },
        defaultMessage(args: ValidationArguments) {
          return `El campo ${args.property} debe ser una latitud válida (un número entre -90 y 90).`;
        },
      },
    });
  };
}

export function IsLongitude(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidLongitude',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return typeof value === 'number' && value >= -180 && value <= 180;
        },
        defaultMessage(args: ValidationArguments) {
          return `El campo ${args.property} debe ser una longitud válida (un número entre -180 y 180).`;
        },
      },
    });
  };
}
