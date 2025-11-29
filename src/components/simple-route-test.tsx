// src/components/SimpleRouteTest.tsx
import React, { useEffect } from "react";
import { useHereMap } from "@/hooks/useHereMap";
import { sampleOrders } from "@/types/order";

const SimpleRouteTest: React.FC = () => {
  const { isReady, mapRef } = useHereMap();

  useEffect(() => {
    if (!isReady || !mapRef.current) return;

    const H = window.H;
    if (!H) {
      console.error("HERE Maps SDK not available");
      return;
    }

    const map = mapRef.current;

    try {
      console.log("Creating simple test polyline...");

      // Sort orders by creation date and get first two
      const sortedOrders = [...sampleOrders].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const order1 = sortedOrders[0];
      const order2 = sortedOrders[1];

      console.log(`Connecting: ${order1.name} -> ${order2.name}`);
      console.log(
        `Coordinates: ${order1.location.lat},${order1.location.lng} -> ${order2.location.lat},${order2.location.lng}`
      );

      // Create a simple polyline with minimal configuration
      const points = [
        { lat: order1.location.lat, lng: order1.location.lng },
        { lat: order2.location.lat, lng: order2.location.lng },
      ];

      console.log("Points array:", points);

      // Try creating with simple array first
      const simplePolyline = new H.map.Polyline(points, {
        style: { lineWidth: 10, strokeColor: "red" },
      });

      console.log("Simple polyline created:", simplePolyline);

      // Add to map
      map.addObject(simplePolyline);
      console.log("Simple polyline added to map");
    } catch (error) {
      console.error("Error creating simple test polyline:", error);
    }
  }, [isReady, mapRef]);

  return null; // This component doesn't render anything visible
};

export default SimpleRouteTest;
