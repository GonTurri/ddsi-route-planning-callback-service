import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TimeWindowDto {
  @ApiProperty({
    example: '2025-09-21T09:00:00Z',
    description: 'Fecha y hora de inicio de la jornada (Formato ISO-8601 UTC)',
  })
  @IsDateString(
    {},
    {
      message:
        'La fecha de inicio (start) debe ser una fecha válida en formato ISO-8601 UTC.',
    },
  )
  @IsNotEmpty({ message: 'La fecha de inicio no puede estar vacía.' })
  start: string;

  @ApiProperty({
    example: '2025-09-21T18:00:00Z',
    description: 'Fecha y hora de fin de la jornada (Formato ISO-8601 UTC)',
  })
  @IsDateString(
    {},
    {
      message:
        'La fecha de fin (end) debe ser una fecha válida en formato ISO-8601 UTC.',
    },
  )
  @IsNotEmpty({ message: 'La fecha de fin no puede estar vacía.' })
  end: string;
}
