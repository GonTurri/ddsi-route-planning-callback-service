import { IsNumber, IsString, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
} from 'src/shared/decorators/coordinates-validator';

export class DeliveryDto {
  @ApiProperty({
    example: 'DEL-001',
    description: 'Codigo unico de la entrega',
  })
  @IsString({
    message: 'El código de entrega (deliveryCode) debe ser un texto.',
  })
  @IsNotEmpty({ message: 'El código de entrega no puede estar vacío.' })
  deliveryCode: string;

  @ApiProperty({
    example: -34.6037,
    description: 'Latitud del punto de entrega',
  })
  @IsLatitude()
  @IsNotEmpty({ message: 'La latitud no puede estar vacía.' })
  latitude: number;

  @ApiProperty({
    example: -58.3816,
    description: 'Longitud del punto de entrega',
  })
  @IsLongitude()
  @IsNotEmpty({ message: 'La longitud no puede estar vacía.' })
  longitude: number;

  @ApiProperty({
    example: 'Av. Libertador 5000, CABA',
    description: 'Direccion de entrega',
  })
  @IsString({ message: 'La dirección (address) debe ser un texto.' })
  @IsNotEmpty({ message: 'La dirección no puede estar vacía.' })
  address: string;

  @ApiProperty({
    example: 25.5,
    description: 'Peso en kg (debe ser mayor a 0)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El peso (WeightKg) debe ser un número válido.' })
  @IsPositive({
    message: 'El peso (WeightKg) debe ser un número positivo mayor a 0.',
  })
  @IsNotEmpty({ message: 'El peso no puede estar vacío.' })
  WeightKg: number;

  @ApiProperty({
    example: 0.5,
    description: 'Volumen en m3 (debe ser mayor a 0)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El volumen (VolumeM3) debe ser un número válido.' })
  @IsPositive({
    message: 'El volumen (VolumeM3) debe ser un número positivo mayor a 0.',
  })
  @IsNotEmpty({ message: 'El volumen no puede estar vacío.' })
  VolumeM3: number;
}
