import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { GetRouteStatusResponseDto } from '../dtos/response/get-route.response.dto';

@Injectable()
export class RoutingCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private readonly ROUTE_STATUS_TTL_MS = 60_000;

  private buildKey(requestId: string, groupId: string): string {
    return `route_status:${groupId}:${requestId}`;
  }

  async getRouteStatus(
    requestId: string,
    groupId: string,
  ): Promise<GetRouteStatusResponseDto | undefined> {
    const key = this.buildKey(requestId, groupId);
    return this.cache.get<GetRouteStatusResponseDto>(key);
  }

  async setRouteStatus(
    requestId: string,
    groupId: string,
    value: GetRouteStatusResponseDto,
  ): Promise<void> {
    const key = this.buildKey(requestId, groupId);
    await this.cache.set(key, value, this.ROUTE_STATUS_TTL_MS);
  }
}
