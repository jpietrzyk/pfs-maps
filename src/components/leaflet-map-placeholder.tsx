import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import React from "react";

const LeafletMapPlaceholder: React.FC = () => (
  <MapContainer
    center={[51.505, -0.09]}
    zoom={13}
    style={{ width: "100%", height: "100%" }}
    scrollWheelZoom={false}
    attributionControl={false}
    zoomControl={false}
    doubleClickZoom={false}
    dragging={false}
    keyboard={false}
    touchZoom={false}
    boxZoom={false}
    style={{
      width: "100%",
      height: "100%",
      filter: "grayscale(1) opacity(0.7)",
    }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />
  </MapContainer>
);

export default LeafletMapPlaceholder;
