import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { VrpWorkerService } from './vrp-worker.service';
import { randomUUID } from 'crypto';

import { RoutingStatus } from '../../ingestion/entities/routing-status.enum';
import { WebhookStatus } from '../../dispatch/entities/webhook-status.enum';
import { RoutingRequest } from '../../ingestion/entities/routing-request.entity';
import { WebhookOutbox } from '../../dispatch/entities/webhook-outbox.entity';
import { PlanningResult } from '../utils/greedy-route-planner';

import type { RoutingPayload } from '../../ingestion/entities/routing-payload';

interface RawRoutingRequest {
  id: string;
  group_id: string;
  payload: RoutingPayload;
  status: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PlanningService {
  private readonly logger = new Logger(PlanningService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly vrpWorker: VrpWorkerService,
    @InjectRepository(RoutingRequest)
    private readonly requestsRepo: Repository<RoutingRequest>,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processNext(): Promise<void> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    let processingRequest: RawRoutingRequest | null = null;

    try {
      const rows = (await runner.query(
        `SELECT * FROM routing_requests
         WHERE status = $1
         ORDER BY created_at ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED`,
        [RoutingStatus.PENDING],
      )) as RawRoutingRequest[];

      if (!rows.length) {
        await runner.rollbackTransaction();
        return;
      }

      processingRequest = rows[0];

      await runner.manager.update(RoutingRequest, processingRequest.id, {
        status: RoutingStatus.PROCESSING,
      });

      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      this.logger.error('Error Setting transaction as PROCESSING', err);
      return;
    } finally {
      await runner.release();
    }

    if (!processingRequest) return;

    let routePlanningResult: PlanningResult | null = null;
    try {
      const payload = processingRequest.payload;

      routePlanningResult = await this.vrpWorker.run(
        {
          lat: payload.warehouse.latitude,
          lon: payload.warehouse.longitude,
          address: payload.warehouse.address,
        },
        payload.deliveries.map((d) => ({
          deliveryCode: d.deliveryCode,
          lat: d.latitude,
          lon: d.longitude,
          weightKg: d.WeightKg,
          volumeM3: d.VolumeM3,
        })),
        payload.trucks.map((t) => ({
          truckId: t.truckId,
          weightCapacityKg: t.WeightCapacityKg,
          volumeCapacityM3: t.VolumeCapacityM3,
        })),
      );
    } catch (workerErr) {
      this.logger.error(
        `Error in Worker VRP for request ${processingRequest.id}`,
        workerErr,
      );

      await this.requestsRepo.update(processingRequest.id, {
        status: RoutingStatus.FAILED,
      });
      return;
    }

    const runner2 = this.dataSource.createQueryRunner();
    await runner2.connect();
    await runner2.startTransaction();

    try {
      await runner2.manager.update(RoutingRequest, processingRequest.id, {
        status: RoutingStatus.COMPLETED,
      });

      const outboxPayload = {
        event_id: `evt_${randomUUID()}`,
        event_type: 'routing.completed',
        request_id: processingRequest.id,
        timestamp: new Date().toISOString(),
        data: routePlanningResult,
      };

      const newOutboxEntry = runner2.manager.create(WebhookOutbox, {
        id: randomUUID(),
        requestId: processingRequest.id,
        groupId: processingRequest.group_id,
        payload: outboxPayload,
        status: WebhookStatus.PENDING,
        retryCount: 0,
        nextAttemptAt: new Date(),
      });
      await runner2.manager.save(newOutboxEntry);

      await runner2.commitTransaction();
    } catch (err: unknown) {
      await runner2.rollbackTransaction();
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Could not save webhook for request ${processingRequest.id}. ${message}`,
      );

      await this.requestsRepo.update(processingRequest.id, {
        status: RoutingStatus.FAILED,
      });
    } finally {
      await runner2.release();
    }
  }
}
