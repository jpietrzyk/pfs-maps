import MapView from "@/components/maps/abstraction/map-view";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DeliverySidebar from "@/components/delivery-sidebar";
import OrdersCountDisplay from "@/components/ui/orders-count-display";
import { useEffect, useState } from "react";
import { OrdersApi } from "@/services/ordersApi";
import { DeliveriesApi } from "@/services/deliveriesApi";
import type { Order } from "@/types/order";
import { useParams } from "react-router-dom";
import { useDelivery } from "@/hooks/use-delivery";

export default function DeliveryMapPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const { addOrderToDelivery, currentDelivery } = useDelivery();
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);

  useEffect(() => {
    console.log("DeliveryMapPage: Fetching orders for deliveryId:", deliveryId);
    Promise.all([OrdersApi.getOrders(), DeliveriesApi.getDeliveries()]).then(
      ([fetchedOrders, deliveries]) => {
        console.log("DeliveryMapPage: Fetched orders:", fetchedOrders.length);

        // Use delivery model to get orders in proper sequence
        const deliveryOrderIds =
          currentDelivery?.orders?.map((item) => item.orderId) || [];
        console.log("DeliveryMapPage: Delivery order IDs:", deliveryOrderIds);

        // Filter and sort orders according to delivery sequence
        const deliveryOrders = deliveryOrderIds
          .map((orderId) => fetchedOrders.find((order) => order.id === orderId))
          .filter((order): order is Order => order !== undefined);

        console.log("DeliveryMapPage: Delivery orders:", deliveryOrders.length);
        setDeliveryOrders(deliveryOrders);

        // Get unassigned orders by subtracting delivery orders from all orders
        const allAssignedOrderIds = new Set(
          deliveries.flatMap((delivery) =>
            delivery.orders.map((order) => order.orderId)
          )
        );
        const initialUnassignedOrders = fetchedOrders.filter(
          (order) => !allAssignedOrderIds.has(order.id)
        );
        console.log(
          "DeliveryMapPage: Unassigned orders:",
          initialUnassignedOrders.length
        );
        setUnassignedOrders(initialUnassignedOrders);

        // Calculate total orders count (both assigned and unassigned)
        setTotalOrdersCount(fetchedOrders.length);
      }
    );
  }, [deliveryId, currentDelivery]);

  // Refetch orders when an order is removed
  const handleOrderRemoved = () => {
    Promise.all([OrdersApi.getOrders(), DeliveriesApi.getDeliveries()]).then(
      ([fetchedOrders, deliveries]) => {
        // Use delivery model to get orders in proper sequence
        const deliveryOrderIds =
          currentDelivery?.orders?.map((item) => item.orderId) || [];
        const deliveryOrders = deliveryOrderIds
          .map((orderId) => fetchedOrders.find((order) => order.id === orderId))
          .filter((order): order is Order => order !== undefined);
        setDeliveryOrders(deliveryOrders);

        // Get unassigned orders by subtracting delivery orders from all orders
        const allAssignedOrderIds = new Set(
          deliveries.flatMap((delivery) =>
            delivery.orders.map((order) => order.orderId)
          )
        );
        const initialUnassignedOrders = fetchedOrders.filter(
          (order) => !allAssignedOrderIds.has(order.id)
        );
        setUnassignedOrders(initialUnassignedOrders);
      }
    );
  };

  // Update delivery orders when an order is removed or added
  const handleDeliveryOrdersUpdated = (updatedOrders: Order[]) => {
    setDeliveryOrders(updatedOrders);
    // When delivery orders are updated, we need to refresh unassigned orders too
    Promise.all([OrdersApi.getOrders(), DeliveriesApi.getDeliveries()]).then(
      ([fetchedOrders, deliveries]) => {
        // Get unassigned orders by subtracting delivery orders from all orders
        const allAssignedOrderIds = new Set(
          deliveries.flatMap((delivery) =>
            delivery.orders.map((order) => order.orderId)
          )
        );
        const initialUnassignedOrders = fetchedOrders.filter(
          (order) => !allAssignedOrderIds.has(order.id)
        );
        setUnassignedOrders(initialUnassignedOrders);
      }
    );
  };

  return (
    <SidebarProvider>
      <main className="h-screen w-screen overflow-hidden relative flex">
        {/* Map layer at the bottom */}
        <div className="absolute inset-0 z-0">
          <MapView
            orders={deliveryOrders}
            unassignedOrders={unassignedOrders}
            deliveryOrderIds={
              currentDelivery?.orders?.map((item) => item.orderId) || []
            }
            onOrderAddedToDelivery={async () => {
              // Refresh both delivery and unassigned orders
              const [allOrders, deliveries] = await Promise.all([
                OrdersApi.getOrders(),
                DeliveriesApi.getDeliveries(),
              ]);
              // Use delivery model to get orders in proper sequence
              const deliveryOrderIds =
                currentDelivery?.orders?.map((item) => item.orderId) || [];
              const updatedDeliveryOrders = deliveryOrderIds
                .map((orderId) =>
                  allOrders.find((order) => order.id === orderId)
                )
                .filter((order): order is Order => order !== undefined);

              // Get unassigned orders by subtracting delivery orders from all orders
              const allAssignedOrderIds = new Set(
                deliveries.flatMap((delivery) =>
                  delivery.orders.map((order) => order.orderId)
                )
              );
              const updatedUnassignedOrders = allOrders.filter(
                (order) => !allAssignedOrderIds.has(order.id)
              );
              setDeliveryOrders(updatedDeliveryOrders);
              setUnassignedOrders(updatedUnassignedOrders);
              handleDeliveryOrdersUpdated(updatedDeliveryOrders);
            }}
            onRefreshRequested={handleOrderRemoved}
          />
        </div>
        {/* UI overlays above the map, pointer-events-none except sidebar */}
        <div className="relative w-full flex justify-end items-start z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <SidebarTrigger />
          </div>
        </div>
        {/* Total orders count display - positioned at top left, moved right to avoid zoom buttons */}
        <div className="absolute top-4 left-16 z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <OrdersCountDisplay count={totalOrdersCount} />
          </div>
        </div>
        <div className="pointer-events-auto">
          <DeliverySidebar
            onOrderRemoved={handleOrderRemoved}
            onDeliveryOrdersUpdated={handleDeliveryOrdersUpdated}
            unassignedOrders={unassignedOrders}
            onAddOrderToDelivery={async (orderId: string) => {
              try {
                // Use the delivery context's addOrderToDelivery method
                const targetDeliveryId = deliveryId || "DEL-001";
                await addOrderToDelivery(targetDeliveryId, orderId);

                // Refresh local state to match the updated context
                const [allOrders, deliveries] = await Promise.all([
                  OrdersApi.getOrders(),
                  DeliveriesApi.getDeliveries(),
                ]);
                // Use delivery model to get orders in proper sequence
                const deliveryOrderIds =
                  currentDelivery?.orders?.map((item) => item.orderId) || [];
                const updatedDeliveryOrders = deliveryOrderIds
                  .map((orderId) =>
                    allOrders.find((order) => order.id === orderId)
                  )
                  .filter((order): order is Order => order !== undefined);

                // Get unassigned orders by subtracting delivery orders from all orders
                const allAssignedOrderIds = new Set(
                  deliveries.flatMap((delivery) =>
                    delivery.orders.map((order) => order.orderId)
                  )
                );
                const updatedUnassignedOrders = allOrders.filter(
                  (order) => !allAssignedOrderIds.has(order.id)
                );
                setDeliveryOrders(updatedDeliveryOrders);
                setUnassignedOrders(updatedUnassignedOrders);
                handleDeliveryOrdersUpdated(updatedDeliveryOrders);
              } catch (error) {
                console.error("Failed to add order to delivery:", error);
                alert("Failed to add order to delivery");
              }
            }}
          />
        </div>
      </main>
    </SidebarProvider>
  );
}
