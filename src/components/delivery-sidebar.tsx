import {
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from "@/components/ui/sidebar";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemGroup,
} from "@/components/ui/item";
import { useMarkerHighlight } from "@/hooks/use-marker-highlight";

interface Order {
  id: string | number;
  name: string;
  customer: string;
  status: string;
}

const DeliverySidebar = ({ orders = [] }: { orders?: Order[] }) => {
  const { setHighlightedOrderId, highlightedOrderId } = useMarkerHighlight();
  return (
    <Sidebar
      side="right"
      collapsible="none"
      className="border-l bg-white shadow-lg z-50 flex flex-col h-full"
    >
      <SidebarHeader className="font-bold text-lg px-4 py-3 border-b">
        Trasa D-001
      </SidebarHeader>
      <SidebarContent className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <div className="font-semibold text-sm mb-2 text-gray-700">
            Zamówienia przypisane do dostawy
          </div>
          <ItemGroup className="space-y-2">
            {orders.length === 0 && (
              <div className="text-xs text-gray-400">Brak zamówień</div>
            )}
            {orders.map((order) => (
              <Item
                key={order.id}
                className={`bg-gray-50 ${
                  highlightedOrderId === String(order.id)
                    ? "ring-2 ring-blue-400"
                    : ""
                }`}
                onMouseEnter={() => setHighlightedOrderId(String(order.id))}
                onMouseLeave={() => setHighlightedOrderId(null)}
              >
                <ItemContent>
                  <ItemTitle>{order.name}</ItemTitle>
                  <ItemDescription>{order.customer}</ItemDescription>
                  <div className="text-xs text-gray-400">
                    Status: {order.status}
                  </div>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="text-xs text-gray-500 px-4 py-3 border-t">
        Panel boczny - stopka
      </SidebarFooter>
    </Sidebar>
  );
};

export default DeliverySidebar;
