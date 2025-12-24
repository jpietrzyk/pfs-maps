module.exports = {
  getDeliveries: jest.fn().mockResolvedValue([
    {
      id: "delivery-1",
      name: "Test Delivery",
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
      orders: [
        { orderId: "order-1", sequence: 0, status: "pending" },
      ],
    },
  ]),
  addOrderToDelivery: jest.fn().mockImplementation((deliveryId, orderId) => {
    return {
      id: "delivery-1",
      name: "Test Delivery",
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
      orders: [
        { orderId: "order-1", sequence: 0, status: "pending" },
        { orderId, sequence: 1, status: "pending" },
      ],
    };
  }),
};
