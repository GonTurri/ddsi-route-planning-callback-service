import { IsDateString, IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class TimeWindowDto {
  @ApiProperty({
    example: '2025-09-21T09:00:00Z',
    description: 'Inicio de la jornada',
  })
  @IsDateString()
  @IsNotEmpty()
  start: string;

  @ApiProperty({
    example: '2025-09-21T18:00:00Z',
    description: 'Fin de la jornada',
  })
  @IsDateString()
  @IsNotEmpty()
  end: string;
}
