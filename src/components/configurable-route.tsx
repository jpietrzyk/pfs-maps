// src/components/ConfigurableRoute.tsx
import React, { useEffect, useRef } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import { sampleOrders } from "@/types/order";
import type { MapPolyline } from "@/types/here-maps";

interface ConfigurableRouteProps {
  orderIds?: string[]; // Array of order IDs to connect in sequence
  color?: string;
  width?: number;
}

const ConfigurableRoute: React.FC<ConfigurableRouteProps> = ({
  orderIds = ["ORD-003", "ORD-005"], // Default: first two orders
  color = "#ef4444",
  width = 6,
}) => {
  const { isReady, mapRef } = useHereMap();
  const polylinesRef = useRef<MapPolyline[]>([]);
  const routeGroupRef = useRef<unknown>(null);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    // Find orders by IDs
    const routeOrders = sampleOrders.filter((order) =>
      orderIds.includes(order.id)
    );

    if (routeOrders.length < 2) {
      console.warn(
        `Need at least 2 orders to create a route. Found: ${routeOrders.length}`
      );
      return;
    }

    const H = window.H;
    if (!H) {
      console.error("HERE Maps SDK not available");
      return;
    }

    const map = mapRef.current;

    try {
      console.log(
        `Creating route for ${routeOrders.length} orders:`,
        routeOrders.map((o) => o.id)
      );

      // Create a group for the route
      const routeGroup = new H.map.Group();
      routeGroupRef.current = routeGroup;

      // Create LineString for the route
      const routeLineString = new H.geo.LineString();

      // Add all points in sequence
      routeOrders.forEach((order, index) => {
        console.log(
          `Adding point ${index + 1}: ${order.location.lat}, ${
            order.location.lng
          }`
        );
        routeLineString.pushPoint(order.location.lat, order.location.lng);
      });

      // Create polyline
      const routePolyline = new H.map.Polyline(routeLineString, {
        style: {
          lineWidth: width,
          strokeColor: color,
          lineTail: "round",
          lineHead: "round",
        },
      });

      routeGroup.addObject(routePolyline);
      polylinesRef.current.push(routePolyline);

      // Add markers for start and end points
      const startOrder = routeOrders[0];
      const endOrder = routeOrders[routeOrders.length - 1];

      // Start marker
      const startMarker = new H.map.Marker({
        lat: startOrder.location.lat,
        lng: startOrder.location.lng,
      });

      // End marker
      const endMarker = new H.map.Marker({
        lat: endOrder.location.lat,
        lng: endOrder.location.lng,
      });

      routeGroup.addObject(startMarker);
      routeGroup.addObject(endMarker);

      // Add to map
      map.addObject(routeGroup);
      console.log("Route added to map successfully");
    } catch (error) {
      console.error("Error creating configurable route:", error);
    }

    // Cleanup function
    return () => {
      try {
        if (mapRef.current && routeGroupRef.current) {
          mapRef.current.removeObject(routeGroupRef.current);
        }
      } catch (error) {
        console.warn("Error during configurable route cleanup:", error);
      }
      polylinesRef.current = [];
      routeGroupRef.current = null;
    };
  }, [isReady, mapRef, orderIds, color, width]);

  return null; // This component doesn't render anything visible
};

export default ConfigurableRoute;

// Example usage components for easy testing
export const RouteFirstTwoOrders: React.FC = () => (
  <ConfigurableRoute
    orderIds={["ORD-003", "ORD-005"]}
    color="#22c55e"
    width={8}
  />
);

export const RouteLastTwoOrders: React.FC = () => (
  <ConfigurableRoute
    orderIds={["ORD-001", "ORD-004"]}
    color="#3b82f6"
    width={8}
  />
);

export const RouteAllOrders: React.FC = () => {
  const sortedOrders = [...sampleOrders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <ConfigurableRoute
      orderIds={sortedOrders.map((o) => o.id)}
      color="#8b5cf6"
      width={4}
    />
  );
};

export const RouteCustom: React.FC<{
  orderIds: string[];
  color?: string;
  width?: number;
}> = ({ orderIds, color = "#ef4444", width = 6 }) => (
  <ConfigurableRoute orderIds={orderIds} color={color} width={width} />
);
