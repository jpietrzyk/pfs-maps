import { createContext } from "react";
import type { MapProvider } from "@/types/map-provider";

export type MapProviderContextValue = {
  mapProvider: MapProvider | null;
};

export const MapProviderContext = createContext<
  MapProviderContextValue | undefined
>(undefined);
