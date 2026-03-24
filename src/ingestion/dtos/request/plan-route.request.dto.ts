import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsUUID,
  ValidateNested,
  ArrayUnique,
  IsDefined,
  IsNotEmptyObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DeliveryDto } from './delivery.request.dto';
import { TruckDto } from './truck.request.dto';
import { WarehouseDto } from './warehouse.request.dto';
import { TimeWindowDto } from './time-window.request.dto';

export class PlanRouteDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID unico de la solicitud',
  })
  @IsUUID('4', { message: 'El requestId debe ser un formato UUID v4 válido.' })
  requestId: string;

  @ApiProperty({
    description: 'Jornada operativa (ventana horaria)',
    type: TimeWindowDto,
  })
  @ValidateNested()
  @IsDefined({ message: 'El objeto timeWindow es obligatorio' })
  @IsNotEmptyObject({}, { message: 'El timeWindow no puede estar vacío' })
  @Type(() => TimeWindowDto)
  timeWindow: TimeWindowDto;

  @ApiProperty({
    description: 'Datos del deposito de origen',
    type: WarehouseDto,
  })
  @ValidateNested()
  @IsDefined({ message: 'El objeto warehouse es obligatorio' })
  @IsNotEmptyObject({}, { message: 'El warehouse no puede estar vacío' })
  @Type(() => WarehouseDto)
  warehouse: WarehouseDto;

  @ApiProperty({
    description: 'Lista de entregas a planificar (1-100)',
    type: [DeliveryDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray({ message: 'El campo deliveries debe ser una lista (array).' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos 1 entrega en la lista.' })
  @ArrayMaxSize(100, {
    message: 'No se pueden enviar más de 100 entregas por solicitud.',
  })
  @ValidateNested({ each: true })
  @ArrayUnique((delivery: DeliveryDto) => delivery.deliveryCode, {
    message:
      'Los códigos de entrega (deliveryCode) no pueden repetirse dentro de la lista.',
  })
  @Type(() => DeliveryDto)
  deliveries: DeliveryDto[];

  @ApiProperty({
    description: 'Lista de camiones disponibles (1-10)',
    type: [TruckDto],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray({ message: 'El campo trucks debe ser una lista (array).' })
  @ArrayMinSize(1, { message: 'Debe enviar al menos 1 camión en la lista.' })
  @ArrayMaxSize(10, {
    message: 'No se pueden enviar más de 10 camiones por solicitud.',
  })
  @ValidateNested({ each: true })
  @ArrayUnique((truck: TruckDto) => truck.truckId, {
    message: 'truckIds must be unique within the truck list',
  })
  @Type(() => TruckDto)
  trucks: TruckDto[];
}
