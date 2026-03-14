// TODO: Migrate VRP algorithm from class-diagram.puml
// Nearest-neighbor greedy algorithm for Vehicle Routing Problem
import { haversine } from "./haversine";
import { randomUUID } from 'crypto';

export interface Delivery {
  deliveryCode: string;
  lat: number;
  lon: number;
  weightKg: number;
  volumeM3: number;
}

export interface Truck {
  truckId: string;
  weightCapacityKg: number;
  volumeCapacityM3: number;
}

export interface Warehouse {
  lat: number;
  lon: number;
  address: string;
}

export interface RouteResult {
  truckId: string;
  assignedRouteId: string;
  stops: Array<{ stopNumber: number; deliveryCode: string }>;
}

export interface PlanningResult {
  routes: RouteResult[];
  unassignedDeliveries: Array<{ deliveryCode: string; reason: string }>;
}

export function planRoutes(
  warehouse: Warehouse,
  deliveries: Delivery[],
  trucks: Truck[],
): PlanningResult {
  console.log('Planning routes with Greedy Nearest-Neighbor algorithm', {
    warehouse,
    deliveries,
    trucks,
  });
  const unassignedDeliveriesPool = [...deliveries];
  const routes: RouteResult[] = [];
  const unassignedDeliveriesResult: Array<{ deliveryCode: string; reason: string }> = [];

  for (const truck of trucks) {
    let currentLat = warehouse.lat;
    let currentLon = warehouse.lon;
    let remainingWeight = truck.weightCapacityKg;
    let remainingVolume = truck.volumeCapacityM3;

    const stops: Array<{ stopNumber: number; deliveryCode: string }> = [];
    let stopCounter = 1;

    while (unassignedDeliveriesPool.length > 0) {
      let nearestDeliveryIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < unassignedDeliveriesPool.length; i++) {
        const candidate = unassignedDeliveriesPool[i];

        if (
          candidate.weightKg <= remainingWeight &&
          candidate.volumeM3 <= remainingVolume
        ) {
          const dist = haversine(
            currentLat,
            currentLon,
            candidate.lat,
            candidate.lon,
          );

          if (dist < minDistance) {
            minDistance = dist;
            nearestDeliveryIndex = i;
          }
        }
      }

      if (nearestDeliveryIndex === -1) {
        break;
      }

      const selectedDelivery = unassignedDeliveriesPool[nearestDeliveryIndex];

      stops.push({
        stopNumber: stopCounter++,
        deliveryCode: selectedDelivery.deliveryCode,
      });

      currentLat = selectedDelivery.lat;
      currentLon = selectedDelivery.lon;
      remainingWeight -= selectedDelivery.weightKg;
      remainingVolume -= selectedDelivery.volumeM3;

      unassignedDeliveriesPool.splice(nearestDeliveryIndex, 1);
    }

    if (stops.length > 0) {
      routes.push({
        truckId: truck.truckId,
        assignedRouteId: `route_${randomUUID()}`,
        stops: stops,
      });
    }
  }

  for (const leftover of unassignedDeliveriesPool) {
    unassignedDeliveriesResult.push({
      deliveryCode: leftover.deliveryCode,
      reason: 'Capacity exceeded or insufficient trucks available',
    });
  }

  return {
    routes,
    unassignedDeliveries: unassignedDeliveriesResult,
  };
}
