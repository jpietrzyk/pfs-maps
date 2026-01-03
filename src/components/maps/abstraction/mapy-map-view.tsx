/**
 * MapyCzMapView - Map view component for Mapy.cz using the MapyMapRenderer
 * Integrates with delivery route context and follows same pattern as MapView
 */
import React from "react";
import type { Order } from "@/types/order";
import MapyCzAdapter from "./mapy-adapter";

interface MapyCzMapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  apiKey: string;
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
}

const MapyCzMapView: React.FC<MapyCzMapViewProps> = ({
  orders,
  unassignedOrders = [],
  apiKey,
  onOrderAddedToDelivery,
  onRefreshRequested,
}) => {
  return (
    <MapyCzAdapter
      orders={orders}
      unassignedOrders={unassignedOrders}
      apiKey={apiKey}
      onOrderAddedToDelivery={onOrderAddedToDelivery}
      onRefreshRequested={onRefreshRequested}
    />
  );
};

export default MapyCzMapView;
