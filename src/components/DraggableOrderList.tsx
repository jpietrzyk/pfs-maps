// src/components/DraggableOrderList.tsx
import React, { useState } from "react";
import { useOrderRoute } from "@/hooks/useOrderRoute";
import type { Order } from "@/types/order";

interface DragItem {
  index: number;
  order: Order;
}

const DraggableOrderList: React.FC = () => {
  const { routeOrders, moveOrder, removeOrderFromRoute } = useOrderRoute();
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number, order: Order) => {
    setDraggedItem({ index, order });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedItem && draggedItem.index !== dropIndex) {
      moveOrder(draggedItem.index, dropIndex);
    }

    setDraggedItem(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
      case "in-progress":
        return { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" };
      case "completed":
        return { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" };
      case "cancelled":
        return { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" };
      default:
        return { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f97316";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  if (routeOrders.length === 0) {
    return (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          color: "#6b7280",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontSize: "14px" }}>No orders in route</div>
        <div style={{ fontSize: "12px", marginTop: "4px" }}>
          Add orders to create a delivery route
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            margin: "0 0 4px 0",
          }}
        >
          Route Orders
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: 0,
          }}
        >
          Drag and drop to reorder the delivery route
        </p>
      </div>

      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {routeOrders.map((order: Order, index: number) => {
          const statusColors = getStatusColor(order.status);
          const priorityColor = getPriorityColor(order.priority);

          return (
            <div
              key={order.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index, order)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                padding: "16px",
                cursor: "move",
                borderBottom: "1px solid #f3f4f6",
                transition: "background-color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {/* Drag Handle */}
              <div
                style={{
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>

              {/* Route Position Indicator */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>

              {/* Order Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.name}
                  </h4>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: priorityColor,
                      flexShrink: 0,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginBottom: "8px",
                  }}
                >
                  {order.customer}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontWeight: "600",
                      backgroundColor: statusColors.bg,
                      color: statusColors.text,
                      border: `1px solid ${statusColors.border}`,
                    }}
                  >
                    {order.status.replace("-", " ").toUpperCase()}
                  </span>

                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {order.location.lat.toFixed(3)},{" "}
                    {order.location.lng.toFixed(3)}
                  </span>
                </div>

                {order.totalAmount && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#374151",
                      marginTop: "4px",
                      fontWeight: "500",
                    }}
                  >
                    €{order.totalAmount.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOrderFromRoute(order.id);
                }}
                style={{
                  padding: "4px",
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  borderRadius: "4px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Remove from route"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DraggableOrderList;
