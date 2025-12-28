import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DeliveriesListPage from "@/pages/DeliveriesListPage";
import DeliveryMapPage from "@/pages/DeliveryMapPage";
import MarkerHighlightProvider from "@/contexts/marker-highlight-provider";
import OrderHighlightProvider from "@/contexts/order-highlight-provider";
import SegmentHighlightProvider from "@/contexts/segment-highlight-provider";
import DeliveryProvider from "@/contexts/delivery-provider";

function App() {
  return (
    <Router>
      <MarkerHighlightProvider>
        <OrderHighlightProvider>
          <SegmentHighlightProvider>
            <DeliveryProvider>
              <Routes>
                <Route path="/" element={<DeliveriesListPage />} />
                <Route path="/deliveries" element={<DeliveryMapPage />} />
                <Route
                  path="/deliveries/:deliveryId"
                  element={<DeliveryMapPage />}
                />
              </Routes>
            </DeliveryProvider>
          </SegmentHighlightProvider>
        </OrderHighlightProvider>
      </MarkerHighlightProvider>
    </Router>
  );
}

export default App;
