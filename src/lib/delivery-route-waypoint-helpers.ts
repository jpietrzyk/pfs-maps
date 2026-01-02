/**
 * Waypoint-based helpers for delivery route management
 *
 * These functions work with the junction table (DeliveryRouteWaypoint)
 * to manage many-to-many relationships between deliveries and orders.
 */

import type { Order } from '@/types/order';
import type { DeliveryRouteWaypoint } from '@/types/delivery-route';

/**
 * Get orders for a delivery in sequence
 *
 * @param waypoints - Waypoints for this delivery, sorted by sequence
 * @param allOrders - All available orders
 * @returns Orders in delivery sequence
 */
export function getOrdersInSequence(
  waypoints: DeliveryRouteWaypoint[],
  allOrders: Order[]
): Order[] {
  // Create a map for O(1) lookup
  const ordersMap = new Map(allOrders.map(o => [o.id, o]));

  return waypoints
    .sort((a, b) => a.sequence - b.sequence)
    .map(waypoint => ordersMap.get(waypoint.orderId))
    .filter((order): order is Order => order !== undefined);
}

/**
 * Get populated waypoints with order data
 *
 * @param waypoints - Waypoints to populate
 * @param allOrders - All available orders
 * @returns Waypoints with order data populated
 */
export function populateWaypoints(
  waypoints: DeliveryRouteWaypoint[],
  allOrders: Order[]
): DeliveryRouteWaypoint[] {
  const ordersMap = new Map(allOrders.map(o => [o.id, o]));

  return waypoints.map(waypoint => ({
    ...waypoint,
    order: ordersMap.get(waypoint.orderId),
  }));
}

/**
 * Validate if an order can be added to a delivery
 *
 * @param orderId - Order ID to add
 * @param deliveryId - Delivery to add to
 * @param existingWaypoints - Current waypoints in the delivery
 * @returns true if order can be added (not already in delivery)
 */
export function canOrderBeAddedToDelivery(
  orderId: string,
  deliveryId: string,
  existingWaypoints: DeliveryRouteWaypoint[]
): boolean {
  // Check if order is already in this delivery
  return !existingWaypoints.some(
    w => w.orderId === orderId && w.deliveryId === deliveryId
  );
}

/**
 * Resequence waypoints after insertion/deletion
 *
 * @param waypoints - Waypoints to resequence
 * @returns Waypoints with updated sequence numbers
 */
export function resequenceWaypoints(
  waypoints: DeliveryRouteWaypoint[]
): DeliveryRouteWaypoint[] {
  return waypoints.map((waypoint, index) => ({
    ...waypoint,
    sequence: index,
  }));
}

/**
 * Calculate total time from waypoints
 *
 * @param waypoints - Waypoints with time estimates
 * @returns Total estimated time in minutes
 */
export function calculateTotalTimeFromWaypoints(
  waypoints: DeliveryRouteWaypoint[]
): number {
  return waypoints.reduce((total, waypoint) => {
    return total + (waypoint.driveTimeEstimate ?? 0);
  }, 0);
}

/**
 * Get order IDs from waypoints in sequence
 *
 * @param waypoints - Waypoints
 * @returns Order IDs in sequence
 */
export function getOrderIdsInSequence(waypoints: DeliveryRouteWaypoint[]): string[] {
  return waypoints
    .sort((a, b) => a.sequence - b.sequence)
    .map(w => w.orderId);
}
