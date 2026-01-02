import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveriesListPage from "@/pages/DeliveriesListPage";
import DeliveryMapPage from "@/pages/DeliveryRouteMapPage";
import DeliveryRouteManagerProvider from "@/providers/DeliveryRouteManagerProvider";

function App() {
  return (
    <Router>
      <DeliveryRouteManagerProvider>
        <Routes>
          <Route path="/" element={<DeliveriesListPage />} />
          <Route path="/deliveries" element={<DeliveryMapPage />} />
          <Route path="/deliveries/:deliveryId" element={<DeliveryMapPage />} />
        </Routes>
      </DeliveryRouteManagerProvider>
    </Router>
  );
}

export default App;
