import { createContext } from "react";
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
