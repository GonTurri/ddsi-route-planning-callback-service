import { IsNumber, IsString, Min } from 'class-validator';

// truck DTO = camión DTO
export class TruckDto {
  //todo: contemplar el caso que nos mandan una lista de truck con id repetidos.
  @IsString()
  truckId: string;

  // capacidad_peso_kg = weight capacity in kg
  @IsNumber()
  @Min(0)
  WeightCapacityKg: number;

  @IsNumber()
  @Min(0)
  VolumeCapacityM3: number;
}
