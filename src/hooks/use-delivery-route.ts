import { useContext } from "react";
import { DeliveryRouteContext } from "@/contexts/delivery-route-context";

export const useDeliveryRoute = () => {
  const context = useContext(DeliveryRouteContext);
  if (context === undefined) {
    throw new Error("useDeliveryRoute must be used within a DeliveryRouteProvider");
  }
  return context;
};
