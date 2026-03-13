import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoutingStatus } from './routing-status.enum';
import type { RoutingPayload } from './routing-payload';

@Entity('routing_requests')
export class RoutingRequest {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'api_key', type: 'uuid' })
  apiKey: string;

  @Column({ type: 'jsonb' })
  payload: RoutingPayload;

  @Column({
    type: 'enum',
    enum: RoutingStatus,
    default: RoutingStatus.PENDING,
  })
  status: RoutingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
