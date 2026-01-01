import type { DeliveryRouteWaypoint } from '@/types/delivery';

// Mock delay to simulate network request
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Store for in-memory data that can be modified
let waypointsData: DeliveryRouteWaypoint[] = [];
let waypointsLoaded = false;

// Load and convert JSON data to DeliveryRouteWaypoint[]
async function loadWaypoints(): Promise<void> {
  if (waypointsLoaded) return;

  try {
    const response = await fetch('/delivery-route-waypoints-DEL-001.json');
    if (!response.ok) {
      throw new Error('Failed to load waypoints data');
    }

    const waypointsJson = await response.json();
    waypointsData = waypointsJson.map((waypoint: any) => ({
      deliveryId: waypoint.deliveryId || 'DEL-001', // Default for legacy data
      orderId: waypoint.orderId,
      sequence: waypoint.sequence,
      status: waypoint.status || 'pending' as const,
      deliveredAt: waypoint.deliveredAt ? new Date(waypoint.deliveredAt) : undefined,
      notes: waypoint.notes,
      order: waypoint.order,
      driveTimeEstimate: waypoint.driveTimeEstimate,
      driveTimeActual: waypoint.driveTimeActual,
      arrivalTime: waypoint.arrivalTime ? new Date(waypoint.arrivalTime) : undefined,
      departureTime: waypoint.departureTime ? new Date(waypoint.departureTime) : undefined
    }));

    waypointsLoaded = true;
  } catch (error) {
    console.error('Failed to load waypoints:', error);
    throw error;
  }
}

export class DeliveryRouteWaypointsApi {
  /**
   * Reset the loaded state - useful for testing
   */
  static resetCache(): void {
    waypointsLoaded = false;
    waypointsData = [];
  }

  /**
   * Fetch all waypoints for a delivery route
   * In the future, this will make a real HTTP request to the backend
   */
  static async getWaypoints(): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();
    // Simulate network delay
    await mockDelay(500);

    // Return a copy of the data to prevent external mutations
    return waypointsData.map(waypoint => ({ ...waypoint }));
  }

  /**
   * Get a specific waypoint by order ID
   */
  static async getWaypointByOrderId(orderId: string): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(300);

    const waypoint = waypointsData.find(wp => wp.orderId === orderId);
    return waypoint ? { ...waypoint } : null;
  }

  /**
   * Get waypoints for a specific delivery route
   */
  static async getWaypointsByDeliveryId(deliveryId: string): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();
    await mockDelay(400);

    // Filter waypoints by delivery route ID and sort by sequence
    return waypointsData
      .filter(wp => wp.deliveryId === deliveryId)
      .sort((a, b) => a.sequence - b.sequence)
      .map(waypoint => ({ ...waypoint }));
  }

  /**
   * Get all deliveries that contain a specific order (for many-to-many lookup)
   */
  static async getWaypointsByOrderId(orderId: string): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();
    await mockDelay(300);

    return waypointsData
      .filter(wp => wp.orderId === orderId)
      .map(waypoint => ({ ...waypoint }));
  }

  /**
   * Add a new waypoint (assign order to delivery)
   */
  static async addWaypoint(
    deliveryId: string,
    orderId: string,
    atIndex?: number
  ): Promise<DeliveryRouteWaypoint> {
    await loadWaypoints();
    await mockDelay(400);

    const existingWaypoints = waypointsData.filter(wp => wp.deliveryId === deliveryId);
    const sequence = atIndex ?? existingWaypoints.length;

    const newWaypoint: DeliveryRouteWaypoint = {
      deliveryId,
      orderId,
      sequence,
      status: 'pending',
    };

    // If inserting at specific index, resequence existing waypoints
    if (atIndex !== undefined && atIndex >= 0) {
      waypointsData
        .filter(wp => wp.deliveryId === deliveryId && wp.sequence >= atIndex)
        .forEach(wp => wp.sequence++);
    }

    waypointsData.push(newWaypoint);
    return { ...newWaypoint };
  }

  /**
   * Remove a waypoint (unassign order from delivery)
   */
  static async removeWaypoint(deliveryId: string, orderId: string): Promise<void> {
    await loadWaypoints();
    await mockDelay(400);

    const waypointIndex = waypointsData.findIndex(
      wp => wp.deliveryId === deliveryId && wp.orderId === orderId
    );

    if (waypointIndex === -1) {
      throw new Error(`Waypoint not found for delivery ${deliveryId} and order ${orderId}`);
    }

    const removedSequence = waypointsData[waypointIndex].sequence;
    waypointsData.splice(waypointIndex, 1);

    // Resequence remaining waypoints in this delivery
    waypointsData
      .filter(wp => wp.deliveryId === deliveryId && wp.sequence > removedSequence)
      .forEach(wp => wp.sequence--);
  }

  /**
   * Reorder waypoints within a delivery
   */
  static async reorderWaypoints(
    deliveryId: string,
    fromIndex: number,
    toIndex: number
  ): Promise<DeliveryRouteWaypoint[]> {
    await loadWaypoints();
    await mockDelay(400);

    const deliveryWaypoints = waypointsData
      .filter(wp => wp.deliveryId === deliveryId)
      .sort((a, b) => a.sequence - b.sequence);

    if (fromIndex < 0 || fromIndex >= deliveryWaypoints.length ||
        toIndex < 0 || toIndex >= deliveryWaypoints.length) {
      throw new Error('Invalid reorder indices');
    }

    // Perform reorder
    const [removed] = deliveryWaypoints.splice(fromIndex, 1);
    deliveryWaypoints.splice(toIndex, 0, removed);

    // Update sequences
    deliveryWaypoints.forEach((wp, index) => {
      const originalWaypoint = waypointsData.find(
        w => w.deliveryId === wp.deliveryId && w.orderId === wp.orderId
      );
      if (originalWaypoint) {
        originalWaypoint.sequence = index;
      }
    });

    return deliveryWaypoints.map(wp => ({ ...wp }));
  }

  /**
   * Update waypoint status
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateWaypointStatus(
    deliveryId: string,
    orderId: string,
    status: DeliveryRouteWaypoint['status'],
    deliveredAt?: Date,
    notes?: string
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(400);

    const waypointIndex = waypointsData.findIndex(
      wp => wp.deliveryId === deliveryId && wp.orderId === orderId
    );
    if (waypointIndex === -1) return null;

    const updatedWaypoint = {
      ...waypointsData[waypointIndex],
      status,
      deliveredAt: status === 'delivered' ? (deliveredAt ?? new Date()) : waypointsData[waypointIndex].deliveredAt,
      notes: notes ?? waypointsData[waypointIndex].notes,
    };

    // Update the in-memory data
    waypointsData[waypointIndex] = updatedWaypoint;

    return { ...updatedWaypoint };
  }

  /**
   * Update waypoint with timing information
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateWaypointTiming(
    deliveryId: string,
    orderId: string,
    updates: Partial<Pick<DeliveryRouteWaypoint, 'arrivalTime' | 'departureTime' | 'driveTimeActual'>>
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(400);

    const waypointIndex = waypointsData.findIndex(
      wp => wp.deliveryId === deliveryId && wp.orderId === orderId
    );
    if (waypointIndex === -1) return null;

    const updatedWaypoint = {
      ...waypointsData[waypointIndex],
      ...updates
    };

    // Update the in-memory data
    waypointsData[waypointIndex] = updatedWaypoint;

    return { ...updatedWaypoint };
  }

  /**
   * Update any waypoint fields
   * Future: This will be a PUT/PATCH request to the backend
   */
  static async updateWaypoint(
    deliveryId: string,
    orderId: string,
    updates: Partial<DeliveryRouteWaypoint>
  ): Promise<DeliveryRouteWaypoint | null> {
    await loadWaypoints();
    await mockDelay(400);

    const waypointIndex = waypointsData.findIndex(
      wp => wp.deliveryId === deliveryId && wp.orderId === orderId
    );
    if (waypointIndex === -1) return null;

    const updatedWaypoint = {
      ...waypointsData[waypointIndex],
      ...updates,
      deliveryId, // Ensure deliveryId doesn't change
      orderId // Ensure orderId doesn't change
    };

    // Update the in-memory data
    waypointsData[waypointIndex] = updatedWaypoint;

    return { ...updatedWaypoint };
  }
}
