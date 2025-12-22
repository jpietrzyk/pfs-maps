import type { MapProvider } from "@/types/map-provider";

// This factory will later support multiple providers (Leaflet, Google, HERE, etc.)
export function getMapProvider(provider: "leaflet" = "leaflet"): MapProvider {
  switch (provider) {
    case "leaflet":
      // Lazy import to avoid loading all providers at once
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("../leaflet/leaflet-map-provider").LeafletMapProvider;
    default:
      throw new Error(`Unknown map provider: ${provider}`);
  }
}
