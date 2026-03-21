import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { GroupsService } from '../../groups/services/groups.service';
import { StudentGroup } from '../../groups/entities/student-group.entity';
import { isUUID } from 'class-validator';

interface RequestWithGroup extends Request {
  group: StudentGroup;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly groupsService: GroupsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithGroup>();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Falta el encabezado Authorization o el formato es incorrecto (debe ser Bearer token)',
      );
    }

    //7 es el largo de "Bearer "
    const apiKey = authHeader.slice(7);

    if (!isUUID(apiKey)) {
      throw new UnauthorizedException(
        'El formato de la API key es inválido (debe ser un UUID)',
      );
    }

    const group = await this.groupsService.findByApiKey(apiKey);

    if (!group) {
      throw new UnauthorizedException('API key inválida o grupo no registrado');
    }

    request.group = group;
    return true;
  }
}
