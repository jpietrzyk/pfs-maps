import React from "react";
import type { Order } from "@/types/order";
import { Plus } from "lucide-react";
import { pl } from "@/lib/translations";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { createExpandedTooltipContent } from "./order-tooltip-utils";

interface UnassignedOrderListProps {
  unassignedOrders: Order[];
  onAddToDelivery: (orderId: string) => void;
  title?: string;
  highlightedOrderId?: string | null;
  setHighlightedOrderId?: (orderId: string | null) => void;
}

export const UnassignedOrderList: React.FC<UnassignedOrderListProps> = ({
  unassignedOrders,
  onAddToDelivery,
  title = pl.availableUnassignedOrders,
  highlightedOrderId,
  setHighlightedOrderId,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="px-4 py-2">
      <div className="font-semibold text-sm mb-2 text-foreground/70">
        {title}
      </div>
      <div>
        {unassignedOrders.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {pl.noUnassignedOrders}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext
              items={unassignedOrders}
              strategy={verticalListSortingStrategy}
            >
              <ul className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3">
                {unassignedOrders.map((order) => (
                  <li key={order.id} className="h-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={`relative w-full aspect-[3/1] rounded border border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer flex items-center justify-center ${
                            highlightedOrderId === order.id
                              ? "ring-1 ring-blue-400 bg-blue-50/50 border-blue-200"
                              : ""
                          }`}
                          onClick={() => onAddToDelivery(order.id)}
                          onMouseEnter={() => setHighlightedOrderId?.(order.id)}
                          onMouseLeave={() => setHighlightedOrderId?.(null)}
                          aria-label={`Add order ${order.id} to delivery`}
                        >
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                            data-testid="product-icon"
                          >
                            <svg
                              className="h-4.5 w-4.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                          </div>
                          <span className="absolute bottom-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-semibold shadow-sm">
                            <Plus className="h-3 w-3" />
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        align="center"
                        sideOffset={12}
                        className="p-0 overflow-hidden"
                      >
                        {createExpandedTooltipContent(order)}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};
