/**
 * MapyCzAdapter - Transforms Order domain models to map data for Mapy.cz
 * Mirrors OrderMapAdapter but renders MapyMapRenderer
 */
import React from "react";
import type { Order } from "@/types/order";
import type { MapMarkerData, MapRouteSegmentData, MapBounds } from "./map-data";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";
import { useOrderHighlight } from "@/hooks/use-order-highlight";
import { useSegmentHighlight } from "@/hooks/use-segment-highlight";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import { MapyRoutingApi } from "@/services/mapyRoutingApi";
import MapyMapRenderer from "../mapy-map-renderer";
import { useEffect, useState } from "react";

// Reuse the popup content creator from OrderMapAdapter
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return { bg: "#fef3c7", text: "#92400e" };
    case "in-progress":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "completed":
      return { bg: "#d1fae5", text: "#065f46" };
    case "cancelled":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
};

const createOrderPopupContent = (order: Order, isPool: boolean) => {
  const statusColors = getStatusColor(order.status);
  return `
    <div style="padding: 16px; max-width: 280px; font-family: system-ui, sans-serif; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
      <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px; color: #111827;">
        ${order.product?.name || "Unknown Order"}
      </div>
      <div style="padding: 8px 12px; background-color: ${
        isPool ? "#f3f4f6" : "#dbeafe"
      }; border-radius: 8px; margin-bottom: 12px; border-left: 3px solid ${
    isPool ? "#9ca3af" : "#3b82f6"
  };">
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
          ${
            isPool
              ? "📦 Pool Order (Unassigned)"
              : "🚛 Delivery Order (Assigned)"
          }
        </div>
      </div>
      <div style="font-size: 13px; color: #4b5563; margin-bottom: 8px;">
        <strong style="color: #374151;">👤 Customer:</strong> ${order.customer}
      </div>
      <div style="font-size: 13px; margin-bottom: 8px;">
        <strong style="color: #374151;">📋 Status:</strong>
        <span style="padding: 4px 10px; border-radius: 16px; font-size: 11px; font-weight: 600; background-color: ${
          statusColors.bg
        }; color: ${statusColors.text}; margin-left: 4px;">
          ${order.status.toUpperCase()}
        </span>
      </div>
      <div style="font-size: 13px; margin-bottom: 8px;">
        <strong style="color: #374151;">💰 Amount:</strong> $${(
          order.totalAmount || 0
        ).toFixed(2)}
      </div>
      <div style="font-size: 13px;">
        <strong style="color: #374151;">📍 Location:</strong> ${order.location.lat.toFixed(
          4
        )}, ${order.location.lng.toFixed(4)}
      </div>
    </div>
  `;
};

interface MapyCzAdapterProps {
  orders: Order[];
  unassignedOrders?: Order[];
  apiKey: string;
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
}

const MapyCzAdapter: React.FC<MapyCzAdapterProps> = ({
  orders,
  unassignedOrders = [],
  apiKey,
  onOrderAddedToDelivery,
  onRefreshRequested,
}) => {
  const { highlightedMarkerId } = useMarkerHighlight();
  const { currentOrderId, previousOrderId } = useOrderHighlight();
  const { highlightedSegmentId } = useSegmentHighlight();
  const { currentDelivery } = useDeliveryRoute();
  const [routeSegments, setRouteSegments] = useState<MapRouteSegmentData[]>([]);

  // Transform orders to markers
  const markers: MapMarkerData[] = [
    ...orders.map((order) => ({
      id: order.id,
      location: order.location,
      type: "delivery" as const,
      isHighlighted: highlightedMarkerId === order.id,
      isCurrentOrder: currentOrderId === order.id,
      isPreviousOrder: previousOrderId === order.id,
      popupContent: createOrderPopupContent(order, false),
    })),
    ...unassignedOrders.map((order) => ({
      id: order.id,
      location: order.location,
      type: order.priority === "high" ? "pool-high-value" : ("pool" as const),
      isHighlighted: highlightedMarkerId === order.id,
      isCurrentOrder: currentOrderId === order.id,
      isPreviousOrder: previousOrderId === order.id,
      popupContent: createOrderPopupContent(order, true),
    })),
  ];

  // Calculate bounds
  const bounds: MapBounds = {
    points: [
      ...orders.map((o) => o.location),
      ...unassignedOrders.map((o) => o.location),
    ],
  };

  // Calculate routes for delivery orders
  useEffect(() => {
    const calculateRoutes = async () => {
      if (!orders.length || !apiKey || orders.length < 2) {
        setRouteSegments([]);
        return;
      }

      try {
        // Get route segments from Mapy.cz routing API
        const segments = await MapyRoutingApi.calculateCompleteRoute(
          orders.map((o) => o.location),
          apiKey,
          "car_fast"
        );

        // Convert segments to route segment data
        const routeData: MapRouteSegmentData[] = segments.map(
          (segment, index) => {
            const coordinates = segment.coordinates as Array<[number, number]>;
            if (coordinates.length < 2) {
              return {
                id: segment.id,
                from: orders[index].location,
                to: orders[index + 1].location,
                isHighlighted: highlightedSegmentId === segment.id,
                highlightColor: "#10b981",
              };
            }

            // Use first and last point from routing response
            return {
              id: segment.id,
              from: {
                lat: coordinates[0][1],
                lng: coordinates[0][0],
              },
              to: {
                lat: coordinates[coordinates.length - 1][1],
                lng: coordinates[coordinates.length - 1][0],
              },
              isHighlighted: highlightedSegmentId === segment.id,
              highlightColor: "#10b981",
            };
          }
        );

        setRouteSegments(routeData);
      } catch (error) {
        console.error("Failed to calculate routes:", error);
        // Fallback to straight lines
        const fallbackRoutes: MapRouteSegmentData[] = [];
        for (let i = 0; i < orders.length - 1; i++) {
          fallbackRoutes.push({
            id: `segment-${i}-${i + 1}`,
            from: orders[i].location,
            to: orders[i + 1].location,
            isHighlighted: false,
            highlightColor: "#10b981",
          });
        }
        setRouteSegments(fallbackRoutes);
      }
    };

    calculateRoutes();
  }, [orders, apiKey, highlightedSegmentId]);

  return (
    <MapyMapRenderer
      markers={markers}
      routes={routeSegments}
      bounds={bounds}
      apiKey={apiKey}
    />
  );
};

export default MapyCzAdapter;
