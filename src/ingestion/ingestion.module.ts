import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutingRequest } from './entities/routing-request.entity';
import { StudentGroup } from '../groups/entities/student-group.entity';
import { IngestionService } from './services/ingestion.service';
import { IngestionController } from './controllers/ingestion.controller';
import { GroupsModule } from '../groups/groups.module';
import { WebhookOutbox } from 'src/dispatch/entities/webhook-outbox.entity';
import { RoutingCacheService } from './services/routing-cache.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoutingRequest, StudentGroup, WebhookOutbox]),
    GroupsModule,
    CacheModule.register(),
  ],
  controllers: [IngestionController],
  providers: [IngestionService, RoutingCacheService],
})
export class IngestionModule {}
