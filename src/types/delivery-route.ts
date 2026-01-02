import type { Order } from './order';

/**
 * DeliveryRoute represents a delivery plan with metadata only.
 *
 * This type contains NO embedded orders array.
 * Orders are linked via DeliveryRouteWaypoint junction table (many-to-many relationship).
 *
 * This separation allows:
 * - Orders to appear in multiple draft deliveries (planning scenarios)
 * - No array synchronization issues
 * - Single source of truth: waypoints table
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
 * DeliveryRouteWaypoint is a junction table establishing many-to-many relationship
 * between DeliveryRoute and Order.
 *
 * Each waypoint represents an order's position in a delivery route with its status
 * and time tracking information.
 *
 * Multiple deliveries can reference the same order (in different draft states).
 * An order can be removed from one delivery without affecting others.
 */
export interface DeliveryRouteWaypoint {
  deliveryId: string;  // Foreign key to DeliveryRoute
  orderId: string;     // Foreign key to Order
  sequence: number;    // Position in the delivery route (0-based)
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  deliveredAt?: Date;
  notes?: string;
  order?: Order;       // Populated order data (for display, populated on demand)
  // Time tracking fields
  driveTimeEstimate?: number; // Estimated drive time from previous location (minutes)
  driveTimeActual?: number;   // Actual drive time from previous location (minutes)
  arrivalTime?: Date;         // When arrived at this order location
  departureTime?: Date;       // When departed from this order location
}

/**
 * @deprecated Use waypoint-based APIs instead
 * Create a new delivery with initial orders
 *
 * This helper is deprecated. Deliveries should be created via API,
 * and orders added via addWaypoint() API calls.
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
    notes: params.notes,
  };
}

/**
 * @deprecated Use addWaypoint() API from DeliveryRouteWaypointsApi instead
 * Add an order to a delivery (legacy embedded array version)
 */
export function addOrderToDelivery(
  delivery: DeliveryRoute,
  orderId: string,
  atIndex?: number
): DeliveryRoute {
  console.warn(
    '[DEPRECATED] addOrderToDelivery is deprecated. Use addWaypoint() API instead.'
  );

  return {
    ...delivery,
    updatedAt: new Date(),
  };
}

/**
 * @deprecated Use removeWaypoint() API from DeliveryRouteWaypointsApi instead
 * Remove an order from a delivery (legacy embedded array version)
 */
export function removeOrderFromDelivery(
  delivery: DeliveryRoute,
  orderId: string
): DeliveryRoute {
  console.warn(
    '[DEPRECATED] removeOrderFromDelivery is deprecated. Use removeWaypoint() API instead.'
  );

  return {
    ...delivery,
    updatedAt: new Date(),
  };
}

/**
 * @deprecated Use reorderWaypoints() API from DeliveryRouteWaypointsApi instead
 * Reorder orders in a delivery (legacy embedded array version)
 */
export function reorderDeliveryOrders(
  delivery: DeliveryRoute,
  fromIndex: number,
  toIndex: number
): DeliveryRoute {
  console.warn(
    '[DEPRECATED] reorderDeliveryOrders is deprecated. Use reorderWaypoints() API instead.'
  );

  return {
    ...delivery,
    updatedAt: new Date(),
  };
}

/**
 * @deprecated Use updateWaypointStatus() API from DeliveryRouteWaypointsApi instead
 * Update delivery order status (legacy embedded array version)
 */
export function updateDeliveryOrderStatus(
  delivery: DeliveryRoute,
  orderId: string,
  status: DeliveryRouteWaypoint['status'],
  deliveredAt?: Date,
  notes?: string
): DeliveryRoute {
  console.warn(
    '[DEPRECATED] updateDeliveryOrderStatus is deprecated. Use updateWaypointStatus() API instead.'
  );

  return {
    ...delivery,
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

/**
 * Sample delivery route waypoints (junction table data)
 * These connect orders to deliveries in a many-to-many relationship
 */
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
