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
   * Returns one route segment for each pair of consecutive waypoints
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

    const segments: RouteSegment[] = [];

    // Calculate route for each consecutive pair
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const segmentId = `${from.lat},${from.lng}-${to.lat},${to.lng}`;

      // Check cache first
      const cached = this.routeCache.get(segmentId);
      if (cached) {
        segments.push(cached);
        continue;
      }

      try {
        const routeResponse = await this.calculateRoute(
          {
            start: [from.lng, from.lat], // Mapy.cz uses [lng, lat]
            end: [to.lng, to.lat],
            routeType: options?.routeType || 'car_fast',
            format: 'geojson',
            avoidToll: options?.avoidToll,
            avoidHighways: options?.avoidHighways,
          },
          apiKey
        );

        const positions = this.convertGeoJSONToPositions(
          routeResponse.geometry.geometry.coordinates
        );

        const segment: RouteSegment = {
          id: segmentId,
          from,
          to,
          positions,
          distance: routeResponse.length,
          duration: routeResponse.duration,
        };

        // Cache the result
        this.routeCache.set(segmentId, segment);
        segments.push(segment);
      } catch (error) {
        console.error(`Failed to calculate route segment ${segmentId}:`, error);
        // Fallback to straight line
        segments.push({
          id: segmentId,
          from,
          to,
          positions: [from, to],
        });
      }
    }

    return segments;
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
