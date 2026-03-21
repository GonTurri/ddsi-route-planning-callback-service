import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
} from 'src/shared/decorators/coordinates-validator';

// warehouse DTO = deposito DTO
export class WarehouseDto {
  @ApiProperty({ example: -34.3556, description: 'Latitud del deposito' })
  @IsLatitude()
  @IsNotEmpty({ message: 'La latitud del depósito no puede estar vacía' })
  latitude: number;
  @ApiProperty({ example: -58.42015, description: 'Longitud del deposito' })
  @IsLongitude()
  @IsNotEmpty({ message: 'La longitud del depósito no puede estar vacía' })
  longitude: number;

  @ApiProperty({
    example: 'Av. Corrientes 1234, CABA',
    description: 'Direccion del deposito',
  })
  @IsString({
    message: 'La dirección del depósito debe ser una cadena válida.',
  })
  @IsNotEmpty({ message: 'La dirección del depósito no puede estar vacía.' })
  address: string;
}
