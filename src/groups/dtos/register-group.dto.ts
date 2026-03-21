import { IsString, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterGroupDto {
  @ApiProperty({ example: 'grupo_1', description: 'Nombre del grupo' })
  @IsString({ message: 'El nombre del grupo debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El nombre del grupo no puede estar vacío.' })
  groupName: string;

  @ApiProperty({
    example: 'https://mi-dominio.com/webhook',
    description: 'URL a la que se enviaran las rutas planificadas',
  })
  @IsNotEmpty({ message: 'La URL de callback no puede estar vacío.' })
  @IsUrl(
    { require_protocol: true, protocols: ['https'] },
    { message: 'La URL de callback debe ser válida y utilizar HTTPS.' },
  )
  callbackUrl: string;
}
