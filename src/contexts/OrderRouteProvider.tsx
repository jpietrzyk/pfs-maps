import React, { useState, useCallback } from "react";
import { sampleOrders } from "@/types/order";
import type { Order } from "@/types/order";
import {
  OrderRouteContext,
  type OrderRouteContextType,
} from "./OrderRouteContext";

export const OrderRouteProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [routeOrders, setRouteOrders] = useState<Order[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  const moveOrder = useCallback((fromIndex: number, toIndex: number) => {
    setRouteOrders((currentOrders) => {
      const newOrders = [...currentOrders];
      const [movedOrder] = newOrders.splice(fromIndex, 1);
      newOrders.splice(toIndex, 0, movedOrder);
      return newOrders;
    });
  }, []);

  const addOrderToRoute = useCallback((order: Order) => {
    setRouteOrders((currentOrders) => {
      // Check if order already exists in route
      const exists = currentOrders.some((o) => o.id === order.id);
      if (!exists) {
        return [...currentOrders, order];
      }
      return currentOrders;
    });
  }, []);

  const removeOrderFromRoute = useCallback((orderId: string) => {
    setRouteOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    );
  }, []);

  const clearRoute = useCallback(() => {
    setRouteOrders([]);
  }, []);

  const initializeRouteWithAllOrders = useCallback(() => {
    // Sort orders by creation date as default route
    const sortedOrders = [...sampleOrders].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    setRouteOrders(sortedOrders);
  }, []);

  const contextValue: OrderRouteContextType = {
    routeOrders,
    availableOrders: sampleOrders,
    setRouteOrders,
    moveOrder,
    addOrderToRoute,
    removeOrderFromRoute,
    clearRoute,
    initializeRouteWithAllOrders,
    isCalculatingRoute,
    setIsCalculatingRoute,
  };

  return (
    <OrderRouteContext.Provider value={contextValue}>
      {children}
    </OrderRouteContext.Provider>
  );
};
