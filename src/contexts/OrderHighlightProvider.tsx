import React, { useState } from "react";
import { OrderHighlightContext } from "./OrderHighlightContext";

export const OrderHighlightProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(
    null
  );

  return (
    <OrderHighlightContext.Provider
      value={{ highlightedOrderId, setHighlightedOrderId }}
    >
      {children}
    </OrderHighlightContext.Provider>
  );
};
