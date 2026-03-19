import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutingRequest } from '../entities/routing-request.entity';
import { PlanRouteDto } from '../dtos/request/plan-route.request.dto';
import { PlanRouteResponseDto } from '../dtos/response/plan-route.response.dto';
import { RoutingStatus } from '../entities/routing-status.enum';
import { WebhookOutbox } from '../../dispatch/entities/webhook-outbox.entity';
import { TimeWindowDto } from '../dtos/request/time-window.request.dto';
import { GetRouteStatusResponseDto } from '../dtos/response/get-route.response.dto';
import { isSameDay } from '../utils/is-same-day.util';
import { RoutingCacheService } from './routing-cache.service';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(RoutingRequest)
    private readonly requestsRepo: Repository<RoutingRequest>,

    @InjectRepository(WebhookOutbox)
    private readonly outboxRepo: Repository<WebhookOutbox>,

    private readonly routingCache: RoutingCacheService,
  ) {}

  private validateTimeWindow(timeWindow: TimeWindowDto): void {
    if (!timeWindow || !timeWindow.start || !timeWindow.end) {
      throw new BadRequestException(
        'Falta la información de la ventana horaria (start y end).',
      );
    }

    const start = new Date(timeWindow.start);
    const end = new Date(timeWindow.end);

    if (start >= end) {
      throw new BadRequestException(
        'La fecha "hasta" debe ser posterior a la fecha "desde" en la ventana horaria.',
      );
    }

    if (!isSameDay(start, end)) {
      throw new BadRequestException(
        'La jornada operativa de los camiones debe comenzar y terminar en el mismo día.',
      );
    }
  }

  async saveRoutingRequest(
    dto: PlanRouteDto,
    groupId: string,
  ): Promise<{ data: PlanRouteResponseDto; created: boolean }> {
    this.validateTimeWindow(dto.timeWindow);

    const existing = await this.requestsRepo.findOneBy({ id: dto.requestId });
    if (existing) {
      if (existing.groupId !== groupId) {
        throw new ConflictException(
          'El requestId proporcionado ya se encuentra en uso. Por favor, genera un nuevo UUID.',
        );
      }

      return {
        data: { requestId: existing.id, status: existing.status },
        created: false,
      };
    }

    const request = this.requestsRepo.create({
      id: dto.requestId,
      groupId: groupId,
      payload: {
        timeWindow: dto.timeWindow,
        warehouse: dto.warehouse,
        deliveries: dto.deliveries,
        trucks: dto.trucks,
      },
      status: RoutingStatus.PENDING,
    });
    const saved = await this.requestsRepo.save(request);

    return {
      data: { requestId: saved.id, status: saved.status },
      created: true,
    };
  }

  async getRoutingStatus(
    requestId: string,
    groupId: string,
  ): Promise<GetRouteStatusResponseDto> {
    const cached = await this.routingCache.getRouteStatus(requestId, groupId);
    if (cached) return cached;

    const request = await this.requestsRepo.findOneBy({
      id: requestId,
      groupId: groupId,
    });

    if (!request) {
      throw new NotFoundException(
        `La solicitud de ruteo con ID ${requestId} no existe o no te pertenece.`,
      );
    }

    const response: GetRouteStatusResponseDto = {
      requestId: request.id,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };

    if (request.isCompleted()) {
      const outboxEntry = await this.outboxRepo.findOneBy({
        requestId: request.id,
      });

      if (
        outboxEntry?.payload &&
        typeof outboxEntry.payload === 'object' &&
        'data' in outboxEntry.payload
      ) {
        response.result = outboxEntry.payload
          .data as GetRouteStatusResponseDto['result'];
      }
    }

    if (request.isFailed()) {
      response.error =
        'La planificacion de rutas fallo debido a un error matematico o datos invalidos.';
    }

    if (request.isCompleted() || request.isFailed()) {
      await this.routingCache.setRouteStatus(requestId, groupId, response);
    }

    return response;
  }
}
