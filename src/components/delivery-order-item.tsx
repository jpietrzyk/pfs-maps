import React from "react";
import type { Order } from "@/types/order";

interface DeliveryOrderItemProps {
  order: Order;
  isHighlighted?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const DeliveryOrderItem: React.FC<DeliveryOrderItemProps> = ({
  order,
  isHighlighted = false,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <li
      className={`rounded border p-2 bg-accent/40 ${
        isHighlighted ? "ring-2 ring-blue-400" : ""
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="font-medium text-sm text-foreground">
        {order.product?.name}
      </div>
      <div className="text-xs text-muted-foreground">{order.customer}</div>
      <div className="text-xs text-muted-foreground/80">
        Status: {order.status}
      </div>
      <div className="text-xs text-muted-foreground/80 mt-1">
        Location: ({order.location.lat.toFixed(4)},{" "}
        {order.location.lng.toFixed(4)})
      </div>
    </li>
  );
};
