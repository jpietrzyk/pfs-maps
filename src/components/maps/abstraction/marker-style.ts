// Shared marker style logic for all map providers
import L from "leaflet";
import type { MapMarkerData } from "./map-data";

// Marker icon URLs (should match across providers)
const ICONS = {
  default: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  pool: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  highlight: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  current: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  previous: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadow: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
};

export function createNumberedIcon(iconUrl: string, badgeNumber?: number) {
  const badge =
    badgeNumber !== undefined
      ? `<span style="position:absolute;top:2px;left:50%;transform:translateX(-50%);background:#111827;color:white;border-radius:9999px;padding:0 6px;font-size:12px;font-weight:700;line-height:18px;box-shadow:0 1px 2px rgba(0,0,0,0.25);">${badgeNumber}</span>`
      : "";
  return L.divIcon({
    html:
      `<div style="position:relative;display:inline-block;width:25px;height:41px;">` +
      `<img src="${iconUrl}" alt="marker" style="width:25px;height:41px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));" />` +
      badge +
      "</div>",
    className: "",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
}

export function getMarkerStyle(marker: MapMarkerData) {
  // Determine icon URL
  let iconUrl = ICONS.default;
  if (marker.isHighlighted) {
    iconUrl = ICONS.highlight;
  } else if (marker.isDisabled) {
    iconUrl = ICONS.pool;
  } else if (marker.isCurrentOrder) {
    iconUrl = ICONS.current;
  } else if (marker.isPreviousOrder) {
    iconUrl = ICONS.previous;
  } else {
    switch (marker.type) {
      case "pool":
      case "pool-high-value":
        iconUrl = ICONS.pool;
        break;
      case "delivery":
      default:
        iconUrl = ICONS.default;
        break;
    }
  }

  // Attach waypoint index badge only for delivery markers with a known sequence
  if (marker.type === "delivery" && marker.waypointIndex !== undefined) {
    return {
      icon: createNumberedIcon(iconUrl, marker.waypointIndex),
      opacity: 1.0,
    };
  }

  // Faded if filtered out
  const opacity = marker.matchesFilters === false ? 0.4 : 1.0;

  return {
    icon: L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: ICONS.shadow,
      shadowSize: [41, 41],
    }),
    opacity,
  };
}
