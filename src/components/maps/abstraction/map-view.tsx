import React from "react";
import type { Order } from "@/types/order";
import LeafletMap from "../leaflet/leaflet-map";
import { mapConfig } from "@/config/map.config";
import type { MapProvider } from "@/types/map-provider";
import { MapProviderContext } from "@/contexts/map-provider-context";
import { getMapProvider } from "./map-provider-factory";
import { useRouteManager } from "@/hooks/use-route-manager";
import { RouteManager } from "@/services/RouteManager";
import { useDelivery } from "@/hooks/use-delivery";

interface MapViewProps {
  unassignedOrders?: Order[];
  onOrderAddedToDelivery?: (orderId: string) => void;
  onRefreshRequested?: () => void;
}

// Render MapView using the configured provider and expose it via context
const MapView: React.FC<MapViewProps> = (props) => {
  const { deliveryOrders } = useDelivery();
  const { setRouteManager: setRouteManagerContext } = useRouteManager();
  const [mapProvider, setMapProvider] = React.useState<MapProvider | null>(
    null
  );
  const [mapInstance, setMapInstance] = React.useState<unknown>(null);
  const providerRef = React.useRef<MapProvider | null>(null);
  const setRouteManagerRef = React.useRef(setRouteManagerContext);

  // Update ref whenever setRouteManager changes
  React.useEffect(() => {
    setRouteManagerRef.current = setRouteManagerContext;
  }, [setRouteManagerContext]);

  // Initialize provider once we have a map instance
  React.useEffect(() => {
    if (!mapInstance || providerRef.current) {
      return;
    }

    let cancelled = false;

    const initializeProvider = async () => {
      try {
        console.log(
          "MapView: initializeProvider starting with mapInstance:",
          !!mapInstance
        );
        const provider = await getMapProvider(
          mapInstance,
          (mapConfig.provider ?? "leaflet") as const
        );
        if (!cancelled) {
          console.log("MapView: provider initialized, provider:", !!provider);
          providerRef.current = provider;
          setMapProvider(provider);
          setRouteManagerRef.current(new RouteManager(provider));
        }
      } catch (error) {
        console.error("MapView: Failed to initialize map provider", error);
      }
    };

    initializeProvider();

    return () => {
      cancelled = true;
    };
  }, [mapInstance]);

  const handleMapReady = React.useCallback((mapInstance: unknown) => {
    setMapInstance(mapInstance);
  }, []);

  // Keep map view fitted to current data once provider is ready
  React.useEffect(() => {
    if (!mapProvider) return;

    // Small delay to ensure map is fully rendered before fitBounds
    const timeoutId = requestAnimationFrame(() => {
      if (deliveryOrders?.length) {
        if (deliveryOrders.length > 1) {
          mapProvider.fitBounds(deliveryOrders);
          return;
        }
        mapProvider.setView(deliveryOrders[0].location, 13);
        return;
      }
      if (props.unassignedOrders?.length) {
        mapProvider.fitBounds(props.unassignedOrders);
      }
    });

    return () => cancelAnimationFrame(timeoutId);
  }, [mapProvider, deliveryOrders, props.unassignedOrders]);

  return (
    <MapProviderContext.Provider value={{ mapProvider }}>
      <LeafletMap {...props} onMapReady={handleMapReady} />
    </MapProviderContext.Provider>
  );
};

export default MapView;
