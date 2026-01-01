import type { MapProvider } from "@/types/map-provider";

export type MapProviderName = "leaflet";

// This factory will later support multiple providers (Leaflet, Google, HERE, etc.)
export async function getMapProvider(
  mapInstance: unknown,
  provider: MapProviderName = "leaflet"
): Promise<MapProvider> {
  switch (provider) {
    case "leaflet": {
      // Lazy import to avoid loading all providers at once
      const { LeafletMapProvider } = await import("@/providers/LeafletMapProvider");
      return new LeafletMapProvider(mapInstance);
    }
    default:
      throw new Error(`Unknown map provider: ${provider}`);
  }
}
