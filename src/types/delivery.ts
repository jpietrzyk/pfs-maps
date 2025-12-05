import type { Order } from './order';

/**
 * Delivery represents a planned delivery route.
 * Orders are "pulled" from the pool and assigned to a delivery.
 * Once assigned, orders are removed from the pool (order.deliveryId is set).
 */
export interface Delivery {
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
  orders: DeliveryOrder[]; // Orders in this delivery with their sequence
  notes?: string;
  estimatedDistance?: number; // in kilometers
  estimatedDuration?: number; // in minutes
}

/**
 * DeliveryOrder represents an order within a delivery with its position and status.
 */
export interface DeliveryOrder {
  orderId: string;
  sequence: number; // Position in the delivery route (0-based)
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  deliveredAt?: Date;
  notes?: string;
  order?: Order; // Populated order data (for display)
}

// Helper function to create a new delivery
export function createDelivery(params: {
  name: string;
  orders: string[]; // Array of order IDs
  driver?: string;
  vehicle?: string;
  scheduledDate?: Date;
  notes?: string;
}): Delivery {
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
    orders: params.orders.map((orderId, index) => ({
      orderId,
      sequence: index,
      status: 'pending',
    })),
    notes: params.notes,
  };
}

// Helper function to add an order to a delivery
export function addOrderToDelivery(
  delivery: Delivery,
  orderId: string,
  atIndex?: number
): Delivery {
  const newDeliveryOrder: DeliveryOrder = {
    orderId,
    sequence: atIndex ?? delivery.orders.length,
    status: 'pending',
  };

  const updatedOrders = [...delivery.orders];

  if (atIndex !== undefined && atIndex >= 0 && atIndex <= delivery.orders.length) {
    updatedOrders.splice(atIndex, 0, newDeliveryOrder);
    // Resequence all orders
    updatedOrders.forEach((order, index) => {
      order.sequence = index;
    });
  } else {
    updatedOrders.push(newDeliveryOrder);
  }

  return {
    ...delivery,
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Helper function to remove an order from a delivery
export function removeOrderFromDelivery(
  delivery: Delivery,
  orderId: string
): Delivery {
  const updatedOrders = delivery.orders
    .filter((order) => order.orderId !== orderId)
    .map((order, index) => ({
      ...order,
      sequence: index,
    }));

  return {
    ...delivery,
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Helper function to reorder orders in a delivery
export function reorderDeliveryOrders(
  delivery: Delivery,
  fromIndex: number,
  toIndex: number
): Delivery {
  const updatedOrders = [...delivery.orders];
  const [removed] = updatedOrders.splice(fromIndex, 1);
  updatedOrders.splice(toIndex, 0, removed);

  // Resequence all orders
  updatedOrders.forEach((order, index) => {
    order.sequence = index;
  });

  return {
    ...delivery,
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Helper function to update delivery order status
export function updateDeliveryOrderStatus(
  delivery: Delivery,
  orderId: string,
  status: DeliveryOrder['status'],
  deliveredAt?: Date,
  notes?: string
): Delivery {
  const updatedOrders = delivery.orders.map((order) =>
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
    orders: updatedOrders,
    updatedAt: new Date(),
  };
}

// Sample deliveries data
export const sampleDeliveries: Delivery[] = [
  {
    id: 'DEL-001',
    name: 'Morning Delivery Route - Budapest',
    status: 'scheduled',
    driver: 'John Kowalski',
    vehicle: 'Truck-01 (VAN-1234)',
    scheduledDate: new Date('2025-12-06T08:00:00Z'),
    createdAt: new Date('2025-12-05T14:00:00Z'),
    updatedAt: new Date('2025-12-05T15:30:00Z'),
    orders: [
      {
        orderId: 'ORD-001',
        sequence: 0,
        status: 'pending',
      },
      {
        orderId: 'ORD-002',
        sequence: 1,
        status: 'pending',
      },
      {
        orderId: 'ORD-003',
        sequence: 2,
        status: 'pending',
      },
    ],
    notes: 'First delivery of the day. Start at warehouse.',
    estimatedDistance: 45.5,
    estimatedDuration: 120,
  },
];
