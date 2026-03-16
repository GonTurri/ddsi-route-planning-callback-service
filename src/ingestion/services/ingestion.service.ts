import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutingRequest } from '../entities/routing-request.entity';
import { PlanRouteDto } from '../dtos/request/plan-route.dto';
import { PlanRouteResponseDto } from '../dtos/response/plan-route-response.dto';
import { RoutingStatus } from '../entities/routing-status.enum';
import { WebhookOutbox } from '../../dispatch/entities/webhook-outbox.entity';
import { GetRouteStatusResponseDto } from '../dtos/response/get-route-response.dto';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(RoutingRequest)
    private readonly requestsRepo: Repository<RoutingRequest>,

    @InjectRepository(WebhookOutbox)
    private readonly outboxRepo: Repository<WebhookOutbox>,
  ) {}

  async saveRoutingRequest(
    dto: PlanRouteDto,
    groupId: string,
  ): Promise<PlanRouteResponseDto> {
    const existing = await this.requestsRepo.findOneBy({ id: dto.requestId });
    if (existing) {
      return { requestId: existing.id, status: existing.status };
    }

    const request = this.requestsRepo.create({
      id: dto.requestId,
      groupId: groupId,
      payload: {
        warehouse: dto.warehouse,
        deliveries: dto.deliveries,
        trucks: dto.trucks,
      },
      status: RoutingStatus.PENDING,
    });
    const saved = await this.requestsRepo.save(request);

    return { requestId: saved.id, status: saved.status };
  }

  async getRoutingStatus(
    requestId: string,
    groupId: string,
  ): Promise<GetRouteStatusResponseDto> {
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

    if (request.status === RoutingStatus.COMPLETED) {
      const outboxEntry = await this.outboxRepo.findOneBy({
        requestId: request.id,
      });

      if (
        outboxEntry &&
        outboxEntry.payload &&
        typeof outboxEntry.payload === 'object' &&
        'data' in outboxEntry.payload
      ) {
        response.result = outboxEntry.payload
          .data as GetRouteStatusResponseDto['result'];
      }
    }

    if (request.status === RoutingStatus.FAILED) {
      response.error =
        'La planificacion de rutas fallo debido a un error matematico o datos invalidos.';
    }

    return response;
  }
}
