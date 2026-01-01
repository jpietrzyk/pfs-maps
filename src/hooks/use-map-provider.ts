import { useContext } from "react";
import { MapProviderContext } from "@/contexts/map-provider-context";

export function useMapProvider() {
  const context = useContext(MapProviderContext);
  if (!context) {
    throw new Error("useMapProvider must be used within a MapProviderContext.Provider");
  }
  return context;
}
