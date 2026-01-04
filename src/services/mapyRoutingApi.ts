/**
 * Mapy.cz Routing API Service
 * Documentation: https://github.com/mapycom/developer/blob/master/docs/rest-api/routing.md
 */

export interface RoutingRequest {
  start: [number, number]; // [longitude, latitude]
  end: [number, number]; // [longitude, latitude]
  waypoints?: Array<[number, number]>; // Optional waypoints
  routeType?: 'car_fast' | 'car_fast_traffic' | 'car_short' | 'foot_fast' | 'foot_hiking' | 'bike_road' | 'bike_mountain';
  format?: 'geojson' | 'polyline' | 'polyline6';
  avoidToll?: boolean;
  avoidHighways?: boolean;
  departure?: string; // ISO-8601 format
  lang?: string;
}

export interface RoutingResponse {
  length: number; // Route length in meters
  duration: number; // Route duration in seconds
  geometry: {
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: Array<[number, number]>; // [longitude, latitude]
    };
    properties: Record<string, unknown>;
  };
  parts?: Array<{
    length: number;
    duration: number;
  }>;
  routePoints?: Array<{
    originalPosition: [number, number];
    mappedPosition: [number, number];
    snapDistance: number;
    restricted: boolean;
    restrictionType?: string;
  }>;
}

export interface RouteSegment {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  positions?: Array<{ lat: number; lng: number }>; // Full polyline path
  distance?: number; // meters
  duration?: number; // seconds
}

class MapyRoutingApiClass {
  private readonly baseUrl = 'https://api.mapy.com/v1/routing/route';
  private routeCache = new Map<string, RouteSegment>();

  /**
   * Calculate a route between two points
   */
  async calculateRoute(
    request: RoutingRequest,
    apiKey: string
  ): Promise<RoutingResponse> {
    const url = new URL(this.baseUrl);

    // Add API key
    url.searchParams.set('apikey', apiKey);

    // Add start and end coordinates (longitude, latitude)
    url.searchParams.set('start', request.start.join(','));
    url.searchParams.set('end', request.end.join(','));

    // Add route type
    url.searchParams.set('routeType', request.routeType || 'car_fast');

    // Add format
    url.searchParams.set('format', request.format || 'geojson');

    // Add optional waypoints
    if (request.waypoints && request.waypoints.length > 0) {
      const waypointsStr = request.waypoints.map(wp => wp.join(',')).join(';');
      url.searchParams.set('waypoints', waypointsStr);
    }

    // Add optional parameters
    if (request.avoidToll !== undefined) {
      url.searchParams.set('avoidToll', String(request.avoidToll));
    }
    if (request.avoidHighways !== undefined) {
      url.searchParams.set('avoidHighways', String(request.avoidHighways));
    }
    if (request.departure) {
      url.searchParams.set('departure', request.departure);
    }
    if (request.lang) {
      url.searchParams.set('lang', request.lang);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to calculate route: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      );
    }

    return response.json();
  }

  /**
   * Calculate route segments for multiple consecutive waypoints
   * Uses Mapy.cz waypoints parameter to calculate route through all points in a single API call
   * For routes with >15 waypoints, splits into batches (Mapy.cz limit is 15 waypoints per request)
   */
  async calculateRouteSegments(
    waypoints: Array<{ lat: number; lng: number }>,
    apiKey: string,
    options?: {
      routeType?: RoutingRequest['routeType'];
      avoidToll?: boolean;
      avoidHighways?: boolean;
    }
  ): Promise<RouteSegment[]> {
    if (waypoints.length < 2) {
      return [];
    }

    // Mapy.cz API limit: start + end + 15 waypoints = 17 total points
    // So we can handle up to 17 waypoints in one request
    const MAX_WAYPOINTS_PER_REQUEST = 15;

    const segments: RouteSegment[] = [];

    // If we have more waypoints than the limit, we need to batch them
    if (waypoints.length > MAX_WAYPOINTS_PER_REQUEST + 2) {
      // Split into batches with overlap (last point of batch N is first point of batch N+1)
      for (let batchStart = 0; batchStart < waypoints.length - 1; batchStart += MAX_WAYPOINTS_PER_REQUEST + 1) {
        const batchEnd = Math.min(batchStart + MAX_WAYPOINTS_PER_REQUEST + 2, waypoints.length);
        const batchWaypoints = waypoints.slice(batchStart, batchEnd);
        const batchSegments = await this.calculateRouteBatch(batchWaypoints, apiKey, options);
        segments.push(...batchSegments);
      }
    } else {
      // All waypoints fit in one request
      const batchSegments = await this.calculateRouteBatch(waypoints, apiKey, options);
      segments.push(...batchSegments);
    }

    return segments;
  }

  /**
   * Calculate route for a batch of waypoints (up to 17 points)
   * Uses the waypoints parameter to get a single route through all points
   */
  private async calculateRouteBatch(
    waypoints: Array<{ lat: number; lng: number }>,
    apiKey: string,
    options?: {
      routeType?: RoutingRequest['routeType'];
      avoidToll?: boolean;
      avoidHighways?: boolean;
    }
  ): Promise<RouteSegment[]> {
    if (waypoints.length < 2) {
      return [];
    }

    try {
      // Build the request with start, end, and intermediate waypoints
      const start = waypoints[0];
      const end = waypoints[waypoints.length - 1];
      const intermediateWaypoints = waypoints.slice(1, -1);

      const routeResponse = await this.calculateRoute(
        {
          start: [start.lng, start.lat], // Mapy.cz uses [lng, lat]
          end: [end.lng, end.lat],
          waypoints: intermediateWaypoints.length > 0
            ? intermediateWaypoints.map(w => [w.lng, w.lat] as [number, number])
            : undefined,
          routeType: options?.routeType || 'car_fast',
          format: 'geojson',
          avoidToll: options?.avoidToll,
          avoidHighways: options?.avoidHighways,
        },
        apiKey
      );

      console.log('Route calculation:', {
        waypoints: waypoints.length,
        routeLength: routeResponse.length,
        routeDuration: routeResponse.duration,
        parts: routeResponse.parts?.length,
        routePoints: routeResponse.routePoints?.length,
        coordinatesCount: routeResponse.geometry.geometry.coordinates.length,
      });

      // Convert the full route geometry to positions
      const positions = this.convertGeoJSONToPositions(
        routeResponse.geometry.geometry.coordinates
      );

      // Split the polyline into segments using routePoints data
      // routePoints[i] corresponds to waypoints[i] and tells us where it was mapped in the route
      const segments: RouteSegment[] = [];

      if (routeResponse.routePoints && routeResponse.routePoints.length === waypoints.length) {
        // We have routePoints data - use it to split the polyline accurately
        for (let i = 0; i < waypoints.length - 1; i++) {
          // Use the MAPPED positions from the API response, not the original waypoints
          // The mapped positions are where the routing engine actually placed the waypoints
          const fromMappedCoords = routeResponse.routePoints[i].mappedPosition;
          const toMappedCoords = routeResponse.routePoints[i + 1].mappedPosition;

          const from = { lat: fromMappedCoords[1], lng: fromMappedCoords[0] };
          const to = { lat: toMappedCoords[1], lng: toMappedCoords[0] };
          const segmentId = `${from.lat},${from.lng}-${to.lat},${to.lng}`;

          const fromMapped = routeResponse.routePoints[i].mappedPosition;
          const toMapped = routeResponse.routePoints[i + 1].mappedPosition;

          // Find the indices in the positions array that correspond to these mapped positions
          const fromIndex = this.findClosestPositionIndex(positions, {
            lat: fromMapped[1],
            lng: fromMapped[0],
          });
          const toIndex = this.findClosestPositionIndex(positions, {
            lat: toMapped[1],
            lng: toMapped[0],
          });

          // Extract the segment's portion of the polyline
          const segmentPositions = positions.slice(fromIndex, toIndex + 1);

          // Get the part data if available (parts array matches waypoint pairs)
          const part = routeResponse.parts?.[i];

          const segment: RouteSegment = {
            id: segmentId,
            from,
            to,
            positions: segmentPositions.length > 1 ? segmentPositions : [from, to],
            distance: part?.length || routeResponse.length / (waypoints.length - 1),
            duration: part?.duration || routeResponse.duration / (waypoints.length - 1),
          };

          console.log(`Segment ${i}: ${from.lat},${from.lng} -> ${to.lat},${to.lng}`, {
            fromIndex,
            toIndex,
            positionsCount: segmentPositions.length,
            distance: segment.distance,
            duration: segment.duration,
          });

          segments.push(segment);
        }
      } else {
        // No routePoints data - split proportionally based on waypoint count
        // This is a fallback and won't be as accurate
        for (let i = 0; i < waypoints.length - 1; i++) {
          const from = waypoints[i];
          const to = waypoints[i + 1];
          const segmentId = `${from.lat},${from.lng}-${to.lat},${to.lng}`;

          // Approximate split of positions
          const segmentStart = Math.floor((i / (waypoints.length - 1)) * positions.length);
          const segmentEnd = Math.floor(((i + 1) / (waypoints.length - 1)) * positions.length);
          const segmentPositions = positions.slice(segmentStart, segmentEnd + 1);

          const part = routeResponse.parts?.[i];

          const segment: RouteSegment = {
            id: segmentId,
            from,
            to,
            positions: segmentPositions.length > 1 ? segmentPositions : [from, to],
            distance: part?.length || routeResponse.length / (waypoints.length - 1),
            duration: part?.duration || routeResponse.duration / (waypoints.length - 1),
          };

          segments.push(segment);
        }
      }

      return segments;
    } catch (error) {
      console.error(`Failed to calculate route for batch:`, error);
      // Fallback to straight lines
      const segments: RouteSegment[] = [];
      for (let i = 0; i < waypoints.length - 1; i++) {
        const from = waypoints[i];
        const to = waypoints[i + 1];
        segments.push({
          id: `${from.lat},${from.lng}-${to.lat},${to.lng}`,
          from,
          to,
          positions: [from, to],
        });
      }
      return segments;
    }
  }

  /**
   * Find the index of the closest position in the polyline to a given point
   */
  private findClosestPositionIndex(
    positions: Array<{ lat: number; lng: number }>,
    target: { lat: number; lng: number }
  ): number {
    let minDistance = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      // Simple Euclidean distance (good enough for small distances)
      const distance = Math.sqrt(
        Math.pow(pos.lat - target.lat, 2) + Math.pow(pos.lng - target.lng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  /**
   * Clear the route cache
   */
  clearCache(): void {
    this.routeCache.clear();
  }

  /**
   * Convert GeoJSON LineString coordinates from [lng, lat] to [{lat, lng}]
   */
  convertGeoJSONToPositions(
    coordinates: Array<[number, number]>
  ): Array<{ lat: number; lng: number }> {
    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
}

export const MapyRoutingApi = new MapyRoutingApiClass();
