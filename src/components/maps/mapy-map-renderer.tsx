/**
 * MapyMapRenderer - Mapy.cz rendering using Leaflet with Mapy.cz tiles
 * This component only handles rendering, no business logic
 * Matches the interface of LeafletMapRenderer but uses Mapy.cz API
 */
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import type {
  MapMarkerData,
  MapRouteSegmentData,
  MapBounds,
} from "./abstraction/map-data";

interface MapyMapRendererProps {
  markers: MapMarkerData[];
  routes: MapRouteSegmentData[];
  bounds: MapBounds;
  apiKey: string;
  onMarkerHover?: (markerId: string, isHovering: boolean) => void;
  onRouteSegmentHover?: (segmentId: string, isHovering: boolean) => void;
}

// Marker icons matching the Leaflet version
const getMarkerColor = (marker: MapMarkerData): string => {
  if (marker.isHighlighted) return "red";
  if (marker.isCurrentOrder) return "blue";
  if (marker.isPreviousOrder) return "yellow";

  switch (marker.type) {
    case "pool":
      return "grey";
    case "pool-high-value":
      return "orange";
    case "delivery":
    default:
      return "default";
  }
};

const createCustomIcon = (color: string) => {
  const colorMap: Record<string, string> = {
    default:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    yellow:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    grey: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    orange:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  };

  return L.icon({
    iconUrl: colorMap[color] || colorMap["default"],
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });
};

const MapyMapRenderer: React.FC<MapyMapRendererProps> = ({
  markers,
  routes,
  bounds,
  apiKey,
  onMarkerHover,
  onRouteSegmentHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map with Mapy.cz tiles
  useEffect(() => {
    if (!containerRef.current || !apiKey) return;

    const map = L.map(containerRef.current).setView([47.4979, 19.0402], 8);

    // Add Mapy.cz tile layer
    const tileUrl = `https://api.mapy.com/v1/maptiles/basic/256/{z}/{x}/{y}?apikey=${apiKey}`;
    L.tileLayer(tileUrl, {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '<a href="https://api.mapy.com/copyright" target="_blank">&copy; Seznam.cz a.s. a další</a>',
    }).addTo(map);

    // Add Mapy.cz logo
    const LogoControl = L.Control.extend({
      options: { position: "bottomleft" as const },
      onAdd: function () {
        const container = L.DomUtil.create("div");
        const link = L.DomUtil.create("a", "", container);
        link.setAttribute("href", "http://mapy.com/");
        link.setAttribute("target", "_blank");
        link.innerHTML =
          '<img src="https://api.mapy.com/img/api/logo.svg" style="width: 50px; height: auto;" />';
        L.DomEvent.disableClickPropagation(link);
        return container;
      },
    });
    new (LogoControl as typeof L.Control)().addTo(map);

    // Create layer groups
    const routesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    routesLayerRef.current = routesLayer;
    markersLayerRef.current = markersLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      routesLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, [apiKey]);

  // Update bounds and fit map
  useEffect(() => {
    if (!mapRef.current || bounds.points.length === 0) return;

    const deliveryPoints = bounds.points;

    if (deliveryPoints.length === 1) {
      mapRef.current.setView(
        [deliveryPoints[0].lat, deliveryPoints[0].lng],
        13
      );
    } else if (deliveryPoints.length > 1) {
      const leafletBounds = L.latLngBounds(
        deliveryPoints.map((p) => [p.lat, p.lng])
      );
      mapRef.current.fitBounds(leafletBounds, { padding: [40, 40] });
    }
  }, [bounds]);

  // Update routes
  useEffect(() => {
    if (!routesLayerRef.current) return;

    routesLayerRef.current.clearLayers();

    routes.forEach((route) => {
      const polyline = L.polyline(
        [
          [route.from.lat, route.from.lng],
          [route.to.lat, route.to.lng],
        ],
        {
          color: route.isHighlighted
            ? route.highlightColor || "#10b981"
            : "#2563eb",
          weight: route.isHighlighted ? 6 : 4,
          opacity: route.isHighlighted ? 1.0 : 0.8,
        }
      )
        .on("mouseover", () => {
          onRouteSegmentHover?.(route.id, true);
        })
        .on("mouseout", () => {
          onRouteSegmentHover?.(route.id, false);
        })
        .addTo(routesLayerRef.current!);
    });
  }, [routes, onRouteSegmentHover]);

  // Update markers
  useEffect(() => {
    if (!markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    markers.forEach((marker) => {
      const color = getMarkerColor(marker);
      const icon = createCustomIcon(color);

      const leafletMarker = L.marker(
        [marker.location.lat, marker.location.lng],
        {
          icon,
        }
      )
        .on("mouseover", () => {
          onMarkerHover?.(marker.id, true);
        })
        .on("mouseout", () => {
          onMarkerHover?.(marker.id, false);
        })
        .addTo(markersLayerRef.current!);

      if (marker.popupContent) {
        // Create popup with HTML content
        const popupDiv = document.createElement("div");
        popupDiv.innerHTML = marker.popupContent;
        leafletMarker.bindPopup(popupDiv);
      }
    });
  }, [markers, onMarkerHover]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      className="leaflet-container"
    />
  );
};

export default MapyMapRenderer;
