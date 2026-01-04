import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveriesListPage from "@/pages/DeliveriesListPage";
import DeliveryMapPage from "@/pages/DeliveryRouteMapPage";
import MapyCzMapPage from "@/pages/MapyCzMapPage";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";

function App() {
  return (
    <Router>
      <DeliveryRouteManagerProvider>
        <Routes>
          <Route path="/" element={<DeliveriesListPage />} />
          {/* New RESTful routes for delivery routes with optional map provider */}
          <Route path="/delivery_routes" element={<DeliveryMapPage />} />
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

          {/* Legacy routes for backward compatibility */}
          <Route path="/deliveries" element={<DeliveryMapPage />} />
          <Route path="/deliveries/:deliveryId" element={<DeliveryMapPage />} />
          <Route path="/mapy" element={<MapyCzMapPage />} />
          <Route path="/mapy/:deliveryId" element={<MapyCzMapPage />} />
        </Routes>
      </DeliveryRouteManagerProvider>
    </Router>
  );
}

export default App;
