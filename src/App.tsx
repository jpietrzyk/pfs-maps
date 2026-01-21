import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveryRoutesListPage from "@/pages/DeliveryRoutesListPage";
import DeliveryMapPage from "@/pages/DeliveryRouteMapPage";
import MapyCzMapPage from "@/pages/MapyCzMapPage";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";
import HereMapPage from "@/pages/HereMapPage";
import { MapFiltersProvider } from "@/contexts/MapFiltersContext";

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
