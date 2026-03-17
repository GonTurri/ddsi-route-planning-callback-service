import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../shared/guards/api-key.guard';
import { CurrentGroup } from '../../shared/decorators/current-group.decorator';
import { IngestionService } from '../services/ingestion.service';
import { PlanRouteDto } from '../dtos/request/plan-route.dto';
import { PlanRouteResponseDto } from '../dtos/response/plan-route-response.dto';
import { GetRouteStatusResponseDto } from '../dtos/response/get-route-response.dto';
import { StudentGroup } from '../../groups/entities/student-group.entity';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Plan Route')
@ApiBearerAuth()
@Controller('plan-route')
@UseGuards(ApiKeyGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(202)
  @ApiOperation({
    summary: 'Solicitar planificación de rutas (Asíncrono)',
    description: `
Recibe un listado de entregas y camiones para calcular las rutas óptimas. El procesamiento es asíncrono.

### 🪝 Webhook Callback (Notificación de finalización)
Una vez que el motor matemático termine el cálculo (o falle), nuestro \`DispatchService\` enviará un \`POST\` a la URL (\`callbackUrl\`) que configuraste para tu grupo.

#### 🛡️ Seguridad (Verificación de Firma)
El webhook incluye un header llamado \`X-Signature\`. Debes generar un HMAC SHA-256 del cuerpo (body) crudo de la petición usando tu \`clientSecret\` y comparar ambas firmas para asegurar que la petición proviene de nuestro motor y no de un tercero malicioso.

#### 📦 Payload de Ejemplo (Cuerpo de la petición que recibirás)
\`\`\`json
{
  "event_id": "evt_7b92a1...",
  "event_type": "routing.completed",
  "request_id": "123e4567-e89b-12d3-a456-425614134023",
  "timestamp": "2026-03-18T08:05:00Z",
  "data": {
    "routes": [
      {
        "truckId": "CAMION-CHICO",
        "assignedRouteId": "ROUTE-74EA598C",
        "estimatedStartTime": "2026-03-18T08:00:00.000Z",
        "estimatedEndTime": "2026-03-18T08:47:00.000Z",
        "totalDistanceKm": 8.27,
        "totalDurationMins": 47,
        "stops": [ ... ]
      }
    ],
    "unassignedDeliveries": []
  }
}
\`\`\`

#### ⏱️ Expectativas de Respuesta
Tu servidor debe responder al webhook con un código HTTP \`200 OK\` en menos de **5 segundos**. Si tardas más, asumiremos que hubo un error y reintentaremos el envíoz.
    `,
  })
  @ApiResponse({
    status: 202,
    description: 'Solicitud aceptada para procesamiento',
    type: PlanRouteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de solicitud invalidos' })
  @ApiResponse({ status: 401, description: 'API key invalida o ausente' })
  planRoute(
    @Body() dto: PlanRouteDto,
    @CurrentGroup() group: StudentGroup,
  ): Promise<PlanRouteResponseDto> {
    return this.ingestionService.saveRoutingRequest(dto, group.id);
  }

  @Get(':id')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Consultar el estado y resultado de una planificacion (Polling)',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud (requestId)' })
  @ApiResponse({
    status: 200,
    description: 'Estado actual de la solicitud y sus resultados si finalizo',
    type: GetRouteStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud no encontrada o no pertenece a tu grupo',
  })
  @ApiResponse({ status: 401, description: 'API key invalida o ausente' })
  getPlannedRoute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentGroup() group: StudentGroup,
  ): Promise<GetRouteStatusResponseDto> {
    return this.ingestionService.getRoutingStatus(id, group.id);
  }
}
