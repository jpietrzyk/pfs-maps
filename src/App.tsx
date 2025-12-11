import Sidebar from "@/components/sidebar";
import LeafletMapPlaceholder from "@/components/leaflet-map-placeholder";

import { MarkerHighlightProvider } from "@/contexts/MarkerHighlightProvider";
import { OrderRouteProvider } from "@/contexts/OrderRouteProvider";
import { DeliveryProvider } from "@/contexts/DeliveryProvider";
// import PublicTransitToggle from "@/components/public-transit-toggle.jsx"; // TODO: Convert to TypeScript

function App() {
  return (
    <MarkerHighlightProvider>
      <OrderRouteProvider>
        <DeliveryProvider>
          <div className="h-screen w-screen overflow-hidden relative">
            {/* Leaflet map placeholder in the background */}
            <div className="absolute inset-0 z-0">
              <LeafletMapPlaceholder />
            </div>

            {/* Sidebar overlaid on top of the map */}
            <div className="absolute inset-y-0 left-0 z-9999">
              <Sidebar />
            </div>
          </div>
        </DeliveryProvider>
      </OrderRouteProvider>
    </MarkerHighlightProvider>
  );
}

export default App;
