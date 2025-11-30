import React, { createContext, useState, useCallback } from "react";
import { sampleOrders } from "@/types/order";
import type { Order } from "@/types/order";

export interface OrderRouteContextType {
  // Current order sequence for routing
  routeOrders: Order[];

  // Original orders data
  availableOrders: Order[];

  // Update the route order sequence
  setRouteOrders: (orders: Order[]) => void;

  // Move an order from one position to another
  moveOrder: (fromIndex: number, toIndex: number) => void;

  // Add order to route (if not already present)
  addOrderToRoute: (order: Order) => void;

  // Remove order from route
  removeOrderFromRoute: (orderId: string) => void;

  // Clear the route
  clearRoute: () => void;

  // Initialize route with all orders
  initializeRouteWithAllOrders: () => void;

  // Whether a route is being calculated
  isCalculatingRoute: boolean;
  setIsCalculatingRoute: (calculating: boolean) => void;
}

export const OrderRouteContext = createContext<
  OrderRouteContextType | undefined
>(undefined);
// Custom hook to use the OrderRoute context
export const useOrderRoute = () => {
  const context = React.useContext(OrderRouteContext);
  if (context === undefined) {
    throw new Error("useOrderRoute must be used within an OrderRouteProvider");
  }
  return context;
};

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
