import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";

import type { Order } from "@/types/order";

// Haversine formula for straight-line distance in km
function getDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const aVal =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

const DeliverySidebar = ({ orders = [] }: { orders?: Order[] }) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  return (
    <Sidebar
      side="right"
      className="border-l bg-sidebar text-sidebar-foreground shadow-lg relative z-1200 flex flex-col h-full"
    >
      <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
        Trasa D-001
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="font-semibold text-sm mb-2 text-foreground/70">
            Zamówienia przypisane do dostawy
          </div>
          <ul className="space-y-2">
            {orders.length === 0 && (
              <li className="text-xs text-muted-foreground">Brak zamówień</li>
            )}
            {orders.map((order, idx) => (
              <>
                <li
                  key={String(order.id)}
                  className={`rounded border p-2 bg-accent/40 ${
                    highlightedOrderId === String(order.id)
                      ? "ring-2 ring-blue-400"
                      : ""
                  }`}
                  onMouseEnter={() => setHighlightedOrderId(String(order.id))}
                  onMouseLeave={() => setHighlightedOrderId(null)}
                >
                  <div className="font-medium text-sm text-foreground">
                    {order.product?.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {order.customer}
                  </div>
                  <div className="text-xs text-muted-foreground/80">
                    Status: {order.status}
                  </div>
                </li>
                {idx < orders.length - 1 && (
                  <li className="flex items-center justify-center text-xs text-muted-foreground/80">
                    ↳ dystans: {getDistanceKm(orders[idx].location, orders[idx + 1].location).toFixed(2)} km
                  </li>
                )}
              </>
            ))}
          </ul>
        </div>
      </SidebarContent>
      <SidebarFooter className="text-xs text-muted-foreground px-4 py-3 border-t">
        Panel boczny - stopka
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
