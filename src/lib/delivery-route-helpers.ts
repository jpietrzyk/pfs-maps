import type { DeliveryRoute, DeliveryRouteWaypoint } from '@/types/delivery';
import type { Order } from '@/types/order';
import { DeliveryRouteWaypointsApi } from '@/services/deliveryRouteWaypointsApi';
import { DeliveriesApi } from '@/services/deliveriesApi';

/**
 * Delivery Route Helpers
 * 
 * These helper functions enforce the waypoint-first architecture pattern.
 * All operations go through the waypoint junction table instead of embedded arrays.
 */

/**
 * Get orders for a delivery in proper sequence
 * This is the primary way to retrieve ordered list of orders for a delivery
 */
export async function getOrdersForDelivery(
  deliveryId: string,
  allOrders: Order[]
): Promise<Order[]> {
  const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDeliveryId(deliveryId);
  return getOrdersInSequence(waypoints, allOrders);
}

/**
 * Convert waypoints to ordered array of orders
 * Pure function - takes waypoints and order map, returns ordered orders
 */
export function getOrdersInSequence(
  waypoints: DeliveryRouteWaypoint[],
  allOrders: Order[]
): Order[] {
  const ordersMap = new Map(allOrders.map(order => [order.id, order]));
  
  return waypoints
    .sort((a, b) => a.sequence - b.sequence)
    .map(waypoint => ordersMap.get(waypoint.orderId))
    .filter((order): order is Order => order !== undefined);
}

/**
 * Get waypoints with populated order data
 * Useful for components that need both waypoint metadata and order details
 */
export async function getWaypointsWithOrders(
  deliveryId: string,
  allOrders: Order[]
): Promise<(DeliveryRouteWaypoint & { order: Order })[]> {
  const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDeliveryId(deliveryId);
  const ordersMap = new Map(allOrders.map(order => [order.id, order]));
  
  return waypoints
    .sort((a, b) => a.sequence - b.sequence)
    .map(waypoint => {
      const order = ordersMap.get(waypoint.orderId);
      if (!order) return null;
      return { ...waypoint, order };
    })
    .filter((item): item is DeliveryRouteWaypoint & { order: Order } => item !== null);
}

/**
 * Find a specific waypoint for a delivery and order
 */
export async function findWaypoint(
  deliveryId: string,
  orderId: string
): Promise<DeliveryRouteWaypoint | undefined> {
  const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByDeliveryId(deliveryId);
  return waypoints.find(wp => wp.orderId === orderId);
}

/**
 * Check if an order can be added to a delivery
 * Validation logic for business rules
 */
export async function canOrderBeAddedToDelivery(
  orderId: string,
  deliveryId: string,
  delivery?: DeliveryRoute
): Promise<boolean> {
  // Check if order already exists in this delivery
  const existingWaypoint = await findWaypoint(deliveryId, orderId);
  if (existingWaypoint) {
    return false;
  }

  // Check delivery status - can only add to draft or scheduled deliveries
  if (delivery) {
    if (delivery.status === 'completed' || delivery.status === 'cancelled') {
      return false;
    }
  }

  return true;
}

/**
 * Get all deliveries that contain a specific order
 * Enables many-to-many relationship queries
 */
export async function getDeliveriesForOrder(orderId: string): Promise<DeliveryRoute[]> {
  const waypoints = await DeliveryRouteWaypointsApi.getWaypointsByOrderId(orderId);
  const deliveryIds = [...new Set(waypoints.map(wp => wp.deliveryId))];
  
  const deliveries = await Promise.all(
    deliveryIds.map(id => DeliveriesApi.getDelivery(id))
  );
  
  return deliveries.filter((d): d is DeliveryRoute => d !== null);
}

/**
 * Get delivery with full order data
 * Convenience function that combines delivery metadata with ordered list
 */
export async function getDeliveryWithOrders(
  deliveryId: string,
  allOrders: Order[]
): Promise<{ delivery: DeliveryRoute; orders: Order[] } | null> {
  const delivery = await DeliveriesApi.getDelivery(deliveryId);
  if (!delivery) return null;
  
  const orders = await getOrdersForDelivery(deliveryId, allOrders);
  
  return { delivery, orders };
}

/**
 * Calculate total distance for delivery based on waypoint sequence
 * Can be extended to include actual drive distance calculations
 */
export function calculateTotalDistance(waypoints: DeliveryRouteWaypoint[]): number {
  return waypoints.reduce((total, wp) => total + (wp.driveTimeEstimate || 0), 0);
}

/**
 * Calculate total drive time for delivery
 */
export function calculateTotalDriveTime(waypoints: DeliveryRouteWaypoint[]): number {
  return waypoints.reduce((total, wp) => total + (wp.driveTimeActual || wp.driveTimeEstimate || 0), 0);
}
