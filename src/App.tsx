import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveryRoutesListPage from "@/pages/delivery-routes-list-page";
import DeliveryMapPage from "@/pages/delivery-route-map-page";
import MapyCzMapPage from "@/pages/mapy-cz-map-page";
import DeliveryRouteManagerProvider from "@/providers/delivery-route-manager-provider";
import HereMapPage from "@/pages/here-map-page";
import { MapFiltersProvider } from "@/contexts/map-filters-context";

function App() {
  return (
    <MapFiltersProvider>
      <Router>
        <DeliveryRouteManagerProvider>
          <Routes>
            {/* Deliveries list page */}
            <Route
              path="/delivery_routes"
              element={<DeliveryRoutesListPage />}
            />
            {/* Delivery route map pages */}
            <Route
              path="/delivery_routes/:deliveryId"
              element={<DeliveryMapPage />}
            />
            <Route
              path="/delivery_routes/:deliveryId/leaflet"
              element={<DeliveryMapPage />}
            />
            <Route
              path="/delivery_routes/:deliveryId/mapy"
              element={<MapyCzMapPage />}
            />
            <Route
              path="/delivery_routes/:deliveryId/here"
              element={<HereMapPage />}
            />
            {/* Default route */}
            <Route path="/" element={<DeliveryRoutesListPage />} />
          </Routes>
        </DeliveryRouteManagerProvider>
      </Router>
    </MapFiltersProvider>
  );
}

export default App;
