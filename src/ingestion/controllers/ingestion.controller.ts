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

@ApiTags('Plan Route')
@ApiBearerAuth()
@Controller('plan-route')
@UseGuards(ApiKeyGuard)
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post()
  @HttpCode(202)
  @ApiOperation({ summary: 'Solicitar planificacion de rutas' })
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
