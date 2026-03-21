import { IsNumber, IsString, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TruckDto {
  @ApiProperty({
    example: 'CAMION-CHICO',
    description: 'Identificador unico del camion',
  })
  @IsString({ message: 'El id del camión debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El id del camión no puede estar vacío.' })
  truckId: string;

  @ApiProperty({
    example: 1000,
    description: 'Capacidad de peso en kg (debe ser mayor a 0)',
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'La capacidad de peso debe ser un número válido.' })
  @IsPositive({
    message:
      'La capacidad de peso (WeightCapacityKg) del camión debe ser mayor a 0.',
  })
  @IsNotEmpty({ message: 'La capacidad de peso no puede estar vacía.' })
  weightCapacityKg: number;

  @ApiProperty({
    example: 10,
    description: 'Capacidad de volumen en m3 (debe ser mayor a 0)',
    minimum: 0.01,
  })
  @IsNumber(
    {},
    { message: 'La capacidad de volumen debe ser un número válido.' },
  )
  @IsPositive({
    message:
      'La capacidad de volumen (VolumeCapacityM3) del camión debe ser mayor a 0.',
  })
  @IsNotEmpty({ message: 'La capacidad de volumen no puede estar vacía.' })
  volumeCapacityM3: number;
}
