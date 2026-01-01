import type { Order } from './order';

/**
 * DeliveryRoute represents a planned delivery route with metadata only.
 * Orders are linked via DeliveryRouteWaypoint junction table (many-to-many).
 * This allows orders to appear in multiple draft deliveries during planning.
 */
export interface DeliveryRoute {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  driver?: string;
  vehicle?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  estimatedDistance?: number; // in kilometers
  estimatedDuration?: number; // in minutes
  // Time tracking fields
  totalDeliveryTime?: number; // Total time spent delivering all orders (minutes)
  totalDriveTime?: number; // Total time spent driving between locations (minutes)
  totalBuildTime?: number; // Total time spent building garages (minutes)
  totalTime?: number; // Total delivery time including all activities (minutes)
}

/**
 * DeliveryRouteWaypoint represents the junction table between DeliveryRoute and Order.
 * Establishes many-to-many relationship with sequence and status tracking.
 */
export interface DeliveryRouteWaypoint {
  deliveryId: string; // Foreign key to DeliveryRoute
  orderId: string;
  sequence: number; // Position in the delivery route (0-based)
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  deliveredAt?: Date;
  notes?: string;
  order?: Order; // Populated order data (for display)
  // Time tracking fields
  driveTimeEstimate?: number; // Estimated drive time from previous location (minutes)
  driveTimeActual?: number; // Actual drive time from previous location (minutes)
  arrivalTime?: Date; // When arrived at this order location
  departureTime?: Date; // When departed from this order location
}

/**
 * @deprecated Use waypoint-based API instead. Will be removed in Phase 5.
 * Helper function to create a new delivery
 */
export function createDelivery(params: {
  name: string;
  orders: string[]; // Array of order IDs
  driver?: string;
  vehicle?: string;
  scheduledDate?: Date;
  notes?: string;
}): DeliveryRoute {
  const now = new Date();

  return {
    id: `DEL-${Date.now()}`,
    name: params.name,
    status: 'draft',
    driver: params.driver,
    vehicle: params.vehicle,
    scheduledDate: params.scheduledDate,
    createdAt: now,
    updatedAt: now,
    // @ts-expect-error - Legacy code using removed orders array
    orders: params.orders.map((orderId, index) => ({
      orderId,
      sequence: index,
      status: 'pending',
    })),
    notes: params.notes,
  };
}

/**
 * @deprecated Use waypoint-based API instead. Will be removed in Phase 5.
 * Helper function to add an order to a delivery
 */
export function addOrderToDelivery(
  delivery: DeliveryRoute,
  orderId: string,
  atIndex?: number
): DeliveryRoute {
  // @ts-expect-error - Legacy code missing deliveryId from DeliveryRouteWaypoint
  const newDeliveryRouteItem: DeliveryRouteWaypoint = {
    orderId,
    // @ts-expect-error - Legacy code using removed orders array
    sequence: atIndex ?? delivery.orders.length,
    status: 'pending',
  };

  // @ts-expect-error - Legacy code using removed orders array
  const updatedOrders = [...delivery.orders];

  // @ts-expect-error - Legacy code using removed orders array
  if (atIndex !== undefined && atIndex >= 0 && atIndex <= delivery.orders.length) {
    updatedOrders.splice(atIndex, 0, newDeliveryRouteItem);
    // Resequence all orders
    updatedOrders.forEach((order, index) => {
      order.sequence = index;
    });
  } else {
    updatedOrders.push(newDeliveryRouteItem);
  }

  return {
    ...delivery,
    // @ts-expect-error - Legacy code using removed orders array
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

/**
 * @deprecated Use waypoint-based API instead. Will be removed in Phase 5.
 * Helper function to remove an order from a delivery
 */
export function removeOrderFromDelivery(
  delivery: DeliveryRoute,
  orderId: string
): DeliveryRoute {
  // @ts-expect-error - Legacy code using removed orders array
  const updatedOrders = delivery.orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((order: any) => order.orderId !== orderId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((order: any, index: number) => ({
      ...order,
      sequence: index,
    }));

  return {
    ...delivery,
    // @ts-expect-error - Legacy code using removed orders array
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

/**
 * @deprecated Use waypoint-based API instead. Will be removed in Phase 5.
 * Helper function to reorder orders in a delivery
 */
export function reorderDeliveryOrders(
  delivery: DeliveryRoute,
  fromIndex: number,
  toIndex: number
): DeliveryRoute {
  // @ts-expect-error - Legacy code using removed orders array
  const updatedOrders = [...delivery.orders];
  const [removed] = updatedOrders.splice(fromIndex, 1);
  updatedOrders.splice(toIndex, 0, removed);

  // Resequence all orders
  updatedOrders.forEach((order, index) => {
    order.sequence = index;
  });

  return {
    ...delivery,
    // @ts-expect-error - Legacy code using removed orders array
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

/**
 * @deprecated Use waypoint-based API instead. Will be removed in Phase 5.
 * Helper function to update delivery order status
 */
export function updateDeliveryOrderStatus(
  delivery: DeliveryRoute,
  orderId: string,
  status: DeliveryRouteWaypoint['status'],
  deliveredAt?: Date,
  notes?: string
): DeliveryRoute {
  // @ts-expect-error - Legacy code using removed orders array
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedOrders = delivery.orders.map((order: any) =>
    order.orderId === orderId
      ? {
          ...order,
          status,
          deliveredAt: status === 'delivered' ? deliveredAt ?? new Date() : order.deliveredAt,
          notes: notes ?? order.notes,
        }
      : order
  );

  return {
    ...delivery,
    // @ts-expect-error - Legacy code using removed orders array
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Sample deliveries data (metadata only - no embedded orders)
export const sampleDeliveries: DeliveryRoute[] = [
  {
    id: 'DEL-001',
    name: 'Morning Delivery Route - Budapest',
    status: 'scheduled',
    driver: 'John Kowalski',
    vehicle: 'Truck-01 (VAN-1234)',
    scheduledDate: new Date('2025-12-06T08:00:00Z'),
    createdAt: new Date('2025-12-05T14:00:00Z'),
    updatedAt: new Date('2025-12-05T15:30:00Z'),
    notes: 'First delivery of the day. Start at warehouse.',
    estimatedDistance: 45.5,
    estimatedDuration: 120,
  },
];

// Sample delivery waypoints (junction table)
export const sampleDeliveryWaypoints: DeliveryRouteWaypoint[] = [
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-001',
    sequence: 0,
    status: 'pending',
    driveTimeEstimate: 0, // Starting point, no drive time
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-002',
    sequence: 1,
    status: 'pending',
    driveTimeEstimate: 45, // 45 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-003',
    sequence: 2,
    status: 'pending',
    driveTimeEstimate: 30, // 30 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-013',
    sequence: 3,
    status: 'pending',
    driveTimeEstimate: 25, // 25 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-014',
    sequence: 4,
    status: 'pending',
    driveTimeEstimate: 20, // 20 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-015',
    sequence: 5,
    status: 'pending',
    driveTimeEstimate: 15, // 15 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-016',
    sequence: 6,
    status: 'pending',
    driveTimeEstimate: 18, // 18 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-017',
    sequence: 7,
    status: 'pending',
    driveTimeEstimate: 22, // 22 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-018',
    sequence: 8,
    status: 'pending',
    driveTimeEstimate: 12, // 12 minutes drive from previous location
    driveTimeActual: 0,
  },
  {
    deliveryId: 'DEL-001',
    orderId: 'ORD-019',
    sequence: 9,
    status: 'pending',
    driveTimeEstimate: 10, // 10 minutes drive from previous location
    driveTimeActual: 0,
  },
];
