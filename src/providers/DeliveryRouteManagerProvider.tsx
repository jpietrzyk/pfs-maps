import React, { useState, useEffect, useCallback, useRef } from "react";
import { DeliveryContext } from "@/contexts/delivery-context";
import { RouteManagerContext } from "@/contexts/route-manager-context";
import { MarkerHighlightContext } from "@/contexts/marker-highlight-context";
import { OrderHighlightContext } from "@/contexts/order-highlight-context";
import { SegmentHighlightContext } from "@/contexts/segment-highlight-context";
import { PolylineHighlightContext } from "@/contexts/polyline-highlight-context";
import { DeliveriesApi } from "@/services/deliveriesApi";
import { OrdersApi } from "@/services/ordersApi";
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
import { RouteManager } from "@/services/RouteManager";

export default function DeliveryRouteManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Delivery state
  const [deliveries, setDeliveries] = useState<DeliveryRoute[]>([]);
  const [currentDelivery, setCurrentDelivery] = useState<DeliveryRoute | null>(
    null
  );
  const [deliveryOrders, setDeliveryOrders] = useState<Order[]>([]);
  const [unassignedOrders, setUnassignedOrders] = useState<Order[]>([]);

  // Route manager state
  const [routeManager, setRouteManager] = useState<RouteManager | null>(null);

  // Highlight states
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(
    null
  );
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [previousOrderId, setPreviousOrderId] = useState<string | null>(null);
  const [highlightedSegmentId, setHighlightedSegmentId] = useState<
    string | null
  >(null);
  const [highlightedPolylineOrderId, setHighlightedPolylineOrderId] = useState<
    string | null
  >(null);

  // Ref to track if we're in a reorder operation to skip automatic refresh
  const isReorderingRef = useRef(false);

  // Refs to avoid dependency on state in callbacks
  const deliveriesRef = useRef<DeliveryRoute[]>([]);
  const currentDeliveryRef = useRef<DeliveryRoute | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    deliveriesRef.current = deliveries;
  }, [deliveries]);

  useEffect(() => {
    currentDeliveryRef.current = currentDelivery;
  }, [currentDelivery]);

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
        "[DeliveryRouteManagerProvider] Unassigned orders:",
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

  // Fetch orders for the current or provided delivery
  const refreshDeliveryOrders = useCallback(
    async (deliveryId?: string) => {
      try {
        const targetId = deliveryId ?? currentDeliveryRef.current?.id;
        const targetDelivery = deliveryId
          ? deliveriesRef.current.find((d) => d.id === deliveryId)
          : currentDeliveryRef.current;

        if (!targetId || !targetDelivery) {
          setDeliveryOrders([]);
          return [];
        }

        const allOrders = await OrdersApi.getOrders();
        const ordersWithPending = applyPendingOrderUpdates(allOrders);

        // Build orders list based on the delivery's waypoint sequence
        // This ensures the order is preserved when reordering
        const inDelivery = targetDelivery.orders
          .map((waypoint) =>
            ordersWithPending.find((o) => o.id === waypoint.orderId)
          )
          .filter((order): order is Order => order !== undefined);

        setDeliveryOrders(inDelivery);
        return inDelivery;
      } catch (error) {
        console.error("Error fetching delivery orders:", error);
        return [];
      }
    },
    [] // No dependencies - uses refs instead
  );

  // Load deliveries and unassigned orders on mount
  useEffect(() => {
    const loadData = async () => {
      await refreshDeliveries();
      await refreshUnassignedOrders();
      await refreshDeliveryOrders();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // POC: Auto-select first delivery as current delivery
  useEffect(() => {
    if (deliveries.length > 0 && !currentDelivery) {
      console.log(
        "[DeliveryRouteManagerProvider] POC: Auto-selecting first delivery as current:",
        deliveries[0].id
      );
      setCurrentDelivery(deliveries[0]);
    }
  }, [deliveries, currentDelivery]);

  // Refresh delivery orders when current delivery changes
  useEffect(() => {
    // Skip refresh if we're in the middle of a reorder operation
    // The reorderDeliveryOrders function already updates the local state
    if (isReorderingRef.current) {
      console.log(
        "[DeliveryRouteManagerProvider] Skipping refresh during reorder"
      );
      isReorderingRef.current = false;
      return;
    }
    console.log(
      "[DeliveryRouteManagerProvider] Refreshing delivery orders for:",
      currentDelivery?.id
    );
    void refreshDeliveryOrders();
  }, [currentDelivery]); // Only depend on currentDelivery, not refreshDeliveryOrders

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

  // Centralized optimistic helpers to keep deliveryOrders and unassignedOrders in sync
  const applyOptimisticAdd = useCallback(
    (deliveryId: string, orderId: string, atIndex?: number) => {
      const orderFromPool = unassignedOrders.find(
        (order) => order.id === orderId
      );

      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.id !== deliveryId) return d;
          const updatedOrders = [...d.orders];
          const newIndex = atIndex ?? updatedOrders.length;
          const orderAlreadyInDelivery = updatedOrders.some(
            (order) => order.orderId === orderId
          );

          if (!orderAlreadyInDelivery) {
            updatedOrders.splice(newIndex, 0, {
              orderId,
              sequence: newIndex,
              status: "pending",
            });
            updatedOrders.forEach((order, index) => {
              order.sequence = index;
            });
          }

          return {
            ...d,
            orders: updatedOrders,
          };
        })
      );

      if (currentDelivery?.id === deliveryId) {
        setCurrentDelivery((prev) => {
          if (!prev) return null;
          const updatedOrders = [...prev.orders];
          const newIndex = atIndex ?? updatedOrders.length;
          const orderAlreadyInDelivery = updatedOrders.some(
            (order) => order.orderId === orderId
          );

          if (!orderAlreadyInDelivery) {
            updatedOrders.splice(newIndex, 0, {
              orderId,
              sequence: newIndex,
              status: "pending",
            });
            updatedOrders.forEach((order, index) => {
              order.sequence = index;
            });
          }

          return {
            ...prev,
            orders: updatedOrders,
          };
        });
      }

      setUnassignedOrders((prev) =>
        prev.filter((order) => order.id !== orderId)
      );

      setDeliveryOrders((prev) => {
        if (prev.some((order) => order.id === orderId)) return prev;
        if (!orderFromPool) return prev;
        const insertAt = atIndex ?? prev.length;
        const next = [...prev];
        next.splice(insertAt, 0, { ...orderFromPool, deliveryId });
        return next;
      });
    },
    [currentDelivery, unassignedOrders]
  );

  const applyOptimisticRemove = useCallback(
    (deliveryId: string, orderId: string, restoredOrder?: Order) => {
      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.id !== deliveryId) return d;
          const updatedOrders = d.orders
            .filter((order) => order.orderId !== orderId)
            .map((order, index) => ({
              ...order,
              sequence: index,
            }));

          return {
            ...d,
            orders: updatedOrders,
          };
        })
      );

      if (currentDelivery?.id === deliveryId) {
        setCurrentDelivery((prev) => {
          if (!prev) return null;

          const updatedOrders = prev.orders
            .filter((order) => order.orderId !== orderId)
            .map((order, index) => ({
              ...order,
              sequence: index,
            }));

          return {
            ...prev,
            orders: updatedOrders,
          };
        });
      }

      if (restoredOrder) {
        setUnassignedOrders((prev) => [
          ...prev,
          { ...restoredOrder, deliveryId: undefined },
        ]);
      }

      setDeliveryOrders((prev) => prev.filter((order) => order.id !== orderId));
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
        addOptimisticOrderUpdate({
          orderId,
          deliveryId,
        });

        // Optimistic UI update - update local state immediately
        applyOptimisticAdd(deliveryId, orderId, atIndex);

        // Perform API calls in background
        try {
          // First, mark the order as assigned to this delivery
          await OrdersApi.updateOrder(orderId, { deliveryId });

          // Then add it to the delivery
          const updatedDelivery = await DeliveriesApi.addOrderToDelivery(
            deliveryId,
            orderId,
            atIndex
          );

          if (updatedDelivery) {
            // Mark updates as completed
            markDeliveryUpdateCompleted(deliveryId, orderId);
            markOrderUpdateCompleted(orderId);
          }
        } catch (error) {
          console.error("Error adding order to delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);
          markOrderUpdateFailed(orderId);

          // Revert optimistic updates by refetching canonical data
          await refreshDeliveryOrders(deliveryId);
          await refreshUnassignedOrders();
          await refreshDeliveries();
        }
      } catch (error) {
        console.error("Error adding order to delivery:", error);
      }
    },
    [
      applyOptimisticAdd,
      refreshDeliveryOrders,
      refreshUnassignedOrders,
      refreshDeliveries,
    ]
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
        addOptimisticOrderUpdate({
          orderId,
          deliveryId: undefined,
        });

        let restoredOrder = deliveryOrders.find(
          (order) => order.id === orderId
        );
        if (!restoredOrder) {
          const allOrders = await OrdersApi.getAllOrders();
          restoredOrder = allOrders.find((order) => order.id === orderId);
        }

        // Optimistic UI update - update local state immediately
        applyOptimisticRemove(deliveryId, orderId, restoredOrder);

        // Perform API calls in background
        try {
          // First, remove delivery assignment from order (returns to unassigned)
          await OrdersApi.updateOrder(orderId, { deliveryId: undefined });

          // Then remove from delivery
          const updatedDelivery = await DeliveriesApi.removeOrderFromDelivery(
            deliveryId,
            orderId
          );

          if (updatedDelivery) {
            // Mark updates as completed
            markDeliveryUpdateCompleted(deliveryId, orderId);
            markOrderUpdateCompleted(orderId);
          }
        } catch (error) {
          console.error("Error removing order from delivery:", error);
          // Mark updates as failed
          markDeliveryUpdateFailed(deliveryId, orderId);
          markOrderUpdateFailed(orderId);

          // Revert optimistic updates by refetching canonical data
          await refreshDeliveryOrders(deliveryId);
          await refreshUnassignedOrders();
          await refreshDeliveries();
        }
      } catch (error) {
        console.error("Error removing order from delivery:", error);
      }
    },
    [
      applyOptimisticRemove,
      deliveryOrders,
      refreshDeliveryOrders,
      refreshUnassignedOrders,
      refreshDeliveries,
    ]
  );

  // Reorder orders in a delivery
  const reorderDeliveryOrders = useCallback(
    async (deliveryId: string, fromIndex: number, toIndex: number) => {
      try {
        // Set flag before updating state to prevent automatic refresh
        isReorderingRef.current = true;

        const updatedDelivery = await DeliveriesApi.reorderDeliveryOrders(
          deliveryId,
          fromIndex,
          toIndex
        );
        if (updatedDelivery) {
          setDeliveries((prev) =>
            prev.map((d) => (d.id === deliveryId ? updatedDelivery : d))
          );
          if (currentDelivery?.id === deliveryId) {
            setCurrentDelivery(updatedDelivery);
          }
          // Keep deliveryOrders in sync locally so UI and map rerender
          setDeliveryOrders((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            if (!moved) return prev;
            next.splice(toIndex, 0, moved);
            return next;
          });
        }
      } catch (error) {
        console.error("Error reordering delivery orders:", error);
        // Reset flag on error
        isReorderingRef.current = false;
      }
    },
    [currentDelivery]
  );

  const deliveryContextValue = {
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
    refreshDeliveryOrders,
    refreshUnassignedOrders,
  };

  const routeManagerContextValue = {
    routeManager,
    setRouteManager,
  };

  const markerHighlightContextValue = {
    highlightedOrderId,
    setHighlightedOrderId,
  };

  const orderHighlightContextValue = {
    currentOrderId,
    previousOrderId,
    setCurrentOrderId,
    setPreviousOrderId,
  };

  const segmentHighlightContextValue = {
    highlightedSegmentId,
    setHighlightedSegmentId,
  };

  const polylineHighlightContextValue = {
    highlightedPolylineOrderId,
    setHighlightedPolylineOrderId,
  };

  return (
    <DeliveryContext.Provider value={deliveryContextValue}>
      <RouteManagerContext.Provider value={routeManagerContextValue}>
        <MarkerHighlightContext.Provider value={markerHighlightContextValue}>
          <OrderHighlightContext.Provider value={orderHighlightContextValue}>
            <SegmentHighlightContext.Provider
              value={segmentHighlightContextValue}
            >
              <PolylineHighlightContext.Provider
                value={polylineHighlightContextValue}
              >
                {children}
              </PolylineHighlightContext.Provider>
            </SegmentHighlightContext.Provider>
          </OrderHighlightContext.Provider>
        </MarkerHighlightContext.Provider>
      </RouteManagerContext.Provider>
    </DeliveryContext.Provider>
  );
}
