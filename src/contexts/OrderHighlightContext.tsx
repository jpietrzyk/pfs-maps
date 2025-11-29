import { createContext } from "react";

export interface OrderHighlightContextType {
  highlightedOrderId: string | null;
  setHighlightedOrderId: (orderId: string | null) => void;
}

export const OrderHighlightContext = createContext<
  OrderHighlightContextType | undefined
>(undefined);
