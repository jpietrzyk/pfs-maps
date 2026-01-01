import React from "react";
import type { Order } from "@/types/order";
import LeafletMap from "../leaflet/leaflet-map";
import { mapConfig } from "@/config/map.config";
import type { MapProvider } from "@/types/map-provider";
import { MapProviderContext } from "@/contexts/map-provider-context";
import { getMapProvider } from "./map-provider-factory";
import { useRouteManager } from "@/hooks/use-route-manager";
import { RouteManager } from "@/services/RouteManager";

interface MapViewProps {
  orders: Order[];
  unassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
}

// Render MapView using the configured provider and expose it via context
const MapView: React.FC<MapViewProps> = (props) => {
  const { setRouteManager } = useRouteManager();
  const [mapProvider, setMapProvider] = React.useState<MapProvider | null>(
    null
  );
  const providerRef = React.useRef<MapProvider | null>(null);
  const providerName = (mapConfig.provider ?? "leaflet") as const;

  const handleMapReady = React.useCallback(
    async (mapInstance: unknown) => {
      if (providerRef.current) return;

      try {
        const provider = await getMapProvider(mapInstance, providerName);
        providerRef.current = provider;
        setMapProvider(provider);
        setRouteManager(new RouteManager(provider));
      } catch (error) {
        console.error("Failed to initialize map provider", error);
      }
    },
    [providerName, setRouteManager]
  );

  return (
    <MapProviderContext.Provider value={{ mapProvider }}>
      <LeafletMap {...props} onMapReady={handleMapReady} />
    </MapProviderContext.Provider>
  );
};

export default MapView;
