import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeliverySidebar from "@/components/delivery-sidebar";
import DeliveryProvider from "@/contexts/delivery-provider";
import { OrdersApi } from "@/services/ordersApi";
import type { Order } from "@/types/order";

// Mock the OrdersApi
jest.mock("@/services/ordersApi");

const mockOrders: Order[] = [
  {
    id: "order-1",
    product: { name: "Product 1", price: 100, complexity: 1 },
    status: "pending",
    priority: "medium",
    active: true,
    deliveryId: "delivery-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Customer 1",
    totalAmount: 100,
    location: { lat: 52.52, lng: 13.405 },
  },
  {
    id: "order-2",
    product: { name: "Product 2", price: 150, complexity: 2 },
    status: "pending",
    priority: "medium",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    customer: "Customer 2",
    totalAmount: 150,
    location: { lat: 52.52, lng: 13.405 },
  },
];

describe("DeliverySidebar - Assigned Count Update", () => {
  beforeEach(() => {
    // Mock the getOrders method
    (OrdersApi.getOrders as jest.Mock).mockResolvedValue(mockOrders);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update assigned count when order is added to delivery", async () => {
    // Mock the updateOrder method
    (OrdersApi.updateOrder as jest.Mock).mockResolvedValue({
      ...mockOrders[1],
      deliveryId: "delivery-1",
    });

    render(
      <DeliveryProvider>
        <DeliverySidebar
          unassignedOrders={[mockOrders[1]]}
          onAddOrderToDelivery={async (orderId: string) => {
            await OrdersApi.updateOrder(orderId, { deliveryId: "delivery-1" });
            // Simulate the refresh that should happen
            return;
          }}
          refreshTrigger={0}
        />
      </DeliveryProvider>
    );

    // Wait for initial loading
    await waitFor(() => {
      expect(
        screen.queryByText("Loading delivery orders...")
      ).not.toBeInTheDocument();
    });

    // Find the unassigned order and click the add button
    const addButton = screen.getByLabelText(
      `Add order ${mockOrders[1].id} to delivery`
    );
    fireEvent.click(addButton);

    // Wait for the update to complete
    await waitFor(() => {
      // The assigned count should be updated to 2 (from 1)
      expect(
        screen.getByText("2 orders assigned to this delivery")
      ).toBeInTheDocument();
    });
  });

  it("should show correct initial assigned count", async () => {
    render(
      <DeliveryProvider>
        <DeliverySidebar
          unassignedOrders={[mockOrders[1]]}
          refreshTrigger={0}
        />
      </DeliveryProvider>
    );

    // Wait for initial loading
    await waitFor(() => {
      expect(
        screen.queryByText("Loading delivery orders...")
      ).not.toBeInTheDocument();
    });

    // Should show 1 order assigned initially
    expect(
      screen.getByText("1 orders assigned to this delivery")
    ).toBeInTheDocument();
  });
});
