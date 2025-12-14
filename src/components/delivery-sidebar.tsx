import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";

type Order = {
  id: string | number;
  name: string;
  customer: string;
  status: string;
};

const DeliverySidebar = ({ orders = [] }: { orders?: Order[] }) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  return (
    <Sidebar
      side="right"
      collapsible="none"
      className="border-l bg-sidebar text-sidebar-foreground shadow-lg relative z-[1200] flex flex-col h-full"
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
            {orders.map((order) => (
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
                  {order.name}
                </div>
                <div className="text-xs text-muted-foreground">{order.customer}</div>
                <div className="text-xs text-muted-foreground/80">
                  Status: {order.status}
                </div>
              </li>
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
