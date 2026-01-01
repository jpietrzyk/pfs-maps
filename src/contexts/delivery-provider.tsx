import React, { useState, useEffect, useCallback, useRef } from "react";
import { DeliveryContext } from "./delivery-context";
import { DeliveriesApi } from "@/services/deliveriesApi";
import { DeliveryRouteWaypointsApi } from "@/services/deliveryRouteWaypointsApi";
import { OrdersApi } from "@/services/ordersApi";
import {
  getOrdersForDelivery,
  canOrderBeAddedToDelivery,
} from "@/lib/delivery-route-helpers";
import type { DeliveryRoute } from "@/types/delivery";
import type { Order } from "@/types/order";
import {
  addOptimisticDeliveryUpdate,
  addOptimisticOrderUpdate,
  markDeliveryUpdateCompleted,
  markOrderUpdateCompleted,
  markDeliveryUpdateFailed,
  markOrderUpdateFailed,
  applyPendingOrderUpdates,
  applyPendingDeliveryUpdates,
} from "@/lib/local-storage-utils";

export default function DeliveryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deliveries, setDeliveries] = useState<DeliveryRoute[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryRoute | null>(
    null
  );
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);

  // Refs to avoid dependency cycles and prevent unnecessary re-renders
  const isReorderingRef = useRef(false);
  const deliveriesRef = useRef<DeliveryRoute[]>([]);
  const currentDeliveryRef = useRef<DeliveryRoute | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    deliveriesRef.current = deliveries;
  }, [deliveries]);

  useEffect(() => {
    currentDeliveryRef.current = currentDelivery;
  }, [currentDelivery]);

  // Fetch orders for current delivery using waypoint API
  const refreshDeliveryOrders = useCallback(async () => {
    if (!currentDeliveryRef.current || isReorderingRef.current) return;

    try {
      console.log(
        "[DeliveryProvider] Fetching orders for delivery:",
        currentDeliveryRef.current.id
      );
      const allOrders = await OrdersApi.getOrders();
      const orders = await getOrdersForDelivery(
        currentDeliveryRef.current.id,
        allOrders
      );
      console.log(
        "[DeliveryProvider] Orders in sequence:",
        orders.map((o) => o.id)
      );
      setDeliveryOrders(orders);
    } catch (error) {
      console.error("Error fetching delivery orders:", error);
    }
  }, []);

  // Fetch unassigned orders
  const refreshUnassignedOrders = useCallback(async () => {
    try {
      const orders = await OrdersApi.getOrders();
      // Apply pending optimistic updates
      const ordersWithPendingUpdates = applyPendingOrderUpdates(orders);
      const unassigned = ordersWithPendingUpdates.filter(
        (order) => !order.deliveryId
      );
      console.log(
        "[DeliveryProvider] Unassigned orders:",
        unassigned.length,
        unassigned.map((o) => o.id)
      );
      setUnassignedOrders(unassigned);
    } catch (error) {
      console.error("Error fetching unassigned orders:", error);
    }
  }, []);

  // Fetch all deliveries
  const refreshDeliveries = useCallback(async () => {
    try {
      const fetchedDeliveries = await DeliveriesApi.getDeliveries();
      const allOrders = await OrdersApi.getOrders();

      // Apply pending optimistic updates to each delivery
      const deliveriesWithPendingUpdates = fetchedDeliveries.map((delivery) =>
        applyPendingDeliveryUpdates(delivery, allOrders)
      );

      setDeliveries(deliveriesWithPendingUpdates);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  }, []);

  // Load deliveries and unassigned orders on mount
  useEffect(() => {
    const loadData = async () => {
      await refreshDeliveries();
      await refreshUnassignedOrders();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Refresh delivery orders when current delivery changes
  useEffect(() => {
    refreshDeliveryOrders();
  }, [currentDelivery, refreshDeliveryOrders]);

  // Create a new delivery
  const createDelivery = useCallback(
    async (delivery: Omit<DeliveryRoute, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newDelivery = await DeliveriesApi.createDelivery(delivery);
        setDeliveries((prev) => [...prev, newDelivery]);
        setCurrentDelivery(newDelivery);
      } catch (error) {
        console.error("Error creating delivery:", error);
      }
    },
    []
  );

  // Update an existing delivery
  const updateDelivery = useCallback(
    async (id: string, updates: Partial<DeliveryRoute>) => {
      try {
        const updatedDelivery = await DeliveriesApi.updateDelivery(id, updates);
        if (updatedDelivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === id ? updatedDelivery : d))
          );
          if (currentDelivery?.id === id) {
            setCurrentDelivery(updatedDelivery);
          }
        }
      } catch (error) {
        console.error("Error updating delivery:", error);
      }
    },
    [currentDelivery]
  );

  // Delete a delivery
  const deleteDelivery = useCallback(
    async (id: string) => {
      try {
        const success = await DeliveriesApi.deleteDelivery(id);
        if (success) {
          setDeliveries((prev) => prev.filter((d) => d.id !== id));
          if (currentDelivery?.id === id) {
            setCurrentDelivery(null);
          }
        }
      } catch (error) {
        console.error("Error deleting delivery:", error);
      }
    },
    [currentDelivery]
  );

  // Add an order to a delivery (pulls from unassigned)
  const addOrderToDelivery = useCallback(
    async (deliveryId: string, orderId: string, atIndex?: number) => {
      try {
        // Optimistic update - add to local storage first
        addOptimisticDeliveryUpdate({
          deliveryId,
          orderId,
          action: "add",
        });

        // Optimistic UI update - update local state immediately
        setDeliveryOrders((prev) => {
          const allOrders = [...prev];
          // Order will be fetched and inserted by refreshDeliveryOrders after API call
          return allOrders;
        });

        // Optimistic update - remove from unassigned orders
        setUnassignedOrders((prev) =>
          prev.filter((order) => order.id !== orderId)
        );

        // Perform API call in background
        try {
          // Add waypoint (order to delivery assignment)
          await DeliveryRouteWaypointsApi.addWaypoint(
            deliveryId,
            orderId,
            atIndex
          );

          // Mark updates as completed
          markDeliveryUpdateCompleted(deliveryId, orderId);

          // Refresh orders for current delivery if it's the one being modified
          if (currentDeliveryRef.current?.id === deliveryId) {
            await refreshDeliveryOrders();
          }

          // Refresh all deliveries to get updated metadata
          await refreshDeliveries();
        } catch (error) {
          console.error("Error adding order to delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);
          // Refresh to revert optimistic updates
          await refreshDeliveryOrders();
          await refreshUnassignedOrders();
        }
      } catch (error) {
        console.error("Error adding order to delivery:", error);
      }
    },
    [] // No dependencies - uses refs
  );

  // Remove an order from a delivery (returns to unassigned)
  const removeOrderFromDelivery = useCallback(
    async (deliveryId: string, orderId: string) => {
      try {
        // Optimistic update - add to local storage first
        addOptimisticDeliveryUpdate({
          deliveryId,
          orderId,
          action: "remove",
        });

        // Optimistic UI update - remove from delivery orders
        setDeliveryOrders((prev) =>
          prev.filter((order) => order.id !== orderId)
        );

        // Optimistic update - add back to unassigned orders
        const allOrders = await OrdersApi.getOrders();
        const orderToRestore = allOrders.find((order) => order.id === orderId);
        if (orderToRestore) {
          setUnassignedOrders((prev) => [...prev, orderToRestore]);
        }

        // Perform API call in background
        try {
          // Remove waypoint (unassign order from delivery)
          await DeliveryRouteWaypointsApi.removeWaypoint(deliveryId, orderId);

          // Mark updates as completed
          markDeliveryUpdateCompleted(deliveryId, orderId);

          // Refresh orders for current delivery if it's the one being modified
          if (currentDeliveryRef.current?.id === deliveryId) {
            await refreshDeliveryOrders();
          }

          // Refresh all deliveries
          await refreshDeliveries();
        } catch (error) {
          console.error("Error removing order from delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);
          // Refresh to revert optimistic updates
          await refreshDeliveryOrders();
          await refreshUnassignedOrders();
        }
      } catch (error) {
        console.error("Error removing order from delivery:", error);
      }
    },
    [] // No dependencies - uses refs
  );

  // Reorder orders in a delivery using waypoint API
  const reorderDeliveryOrders = useCallback(
    async (deliveryId: string, fromIndex: number, toIndex: number) => {
      try {
        isReorderingRef.current = true;

        // Optimistic UI update - reorder local delivery orders
        setDeliveryOrders((prev) => {
          const updated = [...prev];
          const [removed] = updated.splice(fromIndex, 1);
          updated.splice(toIndex, 0, removed);
          return updated;
        });

        // Perform API call in background
        try {
          const updatedWaypoints =
            await DeliveryRouteWaypointsApi.reorderWaypoints(
              deliveryId,
              fromIndex,
              toIndex
            );

          console.log(
            "[DeliveryProvider] Reordered waypoints:",
            updatedWaypoints.map((wp) => wp.orderId)
          );

          // Refresh to ensure consistency
          await refreshDeliveryOrders();
        } catch (error) {
          console.error("Error reordering delivery orders:", error);
          // Refresh to revert optimistic updates
          await refreshDeliveryOrders();
        } finally {
          isReorderingRef.current = false;
        }
      } catch (error) {
        console.error("Error reordering delivery orders:", error);
        isReorderingRef.current = false;
      }
    },
    [refreshDeliveryOrders]
  );

  const value = {
    deliveries,
    currentDelivery,
    deliveryOrders,
    unassignedOrders,
    setCurrentDelivery,
    setDeliveries,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    addOrderToDelivery,
    removeOrderFromDelivery,
    reorderDeliveryOrders,
    refreshDeliveries,
    refreshUnassignedOrders,
    refreshDeliveryOrders,
  };

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
}
