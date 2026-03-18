import { TruckInfo } from 'src/shared/types/truck-info.interface';

export interface WarehouseInfo {
  latitude: number;
  longitude: number;
  address: string;
}

export interface DeliveryInfo {
  deliveryCode: string;
  latitude: number;
  longitude: number;
  address: string;
  WeightKg: number;
  VolumeM3: number;
}

export interface TimeWindowInfo {
  start: string;
  end: string;
}

export interface RoutingPayload {
  timeWindow: TimeWindowInfo;
  warehouse: WarehouseInfo;
  deliveries: DeliveryInfo[];
  trucks: TruckInfo[];
}
