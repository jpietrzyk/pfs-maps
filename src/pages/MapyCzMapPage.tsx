import MapyMapView from "@/components/maps/abstraction/mapy-map-view";
import DeliveryRouteMapLayout from "@/components/delivery-route-map-layout";
import { useParams } from "react-router-dom";
import { useDeliveryRoute } from "@/hooks/use-delivery-route";
import type { Order } from "@/types/order";

export default function MapyCzMapPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const { refreshDeliveryOrders, refreshUnassignedOrders } = useDeliveryRoute();

  return (
    <DeliveryRouteMapLayout
      renderMap={(
        displayedOrders: Order[],
        filteredUnassignedOrders: Order[],
        onOrderAddedToDelivery,
        onRefreshRequested
      ) => (
        <MapyMapView
          orders={displayedOrders}
          unassignedOrders={filteredUnassignedOrders}
          onOrderAddedToDelivery={onOrderAddedToDelivery}
          onRefreshRequested={onRefreshRequested}
        />
      )}
    />
  );
}
