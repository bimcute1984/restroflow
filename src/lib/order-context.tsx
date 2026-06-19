"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Order, OrderStatus } from "@/types";
import { mockOrders } from "./mock-data";

interface OrderContextValue {
  orders: Order[];
  addOrder: (order: Order) => void;
  advanceStatus: (id: string) => void;
  todayRevenue: number;
  todayOrderCount: number;
}

const OrderContext = createContext<OrderContextValue>({
  orders: [],
  addOrder: () => {},
  advanceStatus: () => {},
  todayRevenue: 0,
  todayOrderCount: 0,
});

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  function addOrder(order: Order) {
    setOrders((prev) => [order, ...prev]);
  }

  function advanceStatus(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const next: Record<OrderStatus, OrderStatus> = {
          pending: "preparing",
          preparing: "ready",
          ready: "completed",
          completed: "completed",
          cancelled: "cancelled",
        };
        return { ...o, status: next[o.status] };
      })
    );
  }

  const completedOrders = orders.filter((o) => o.status === "completed");
  const todayRevenue = completedOrders.reduce((s, o) => s + o.total, 0);
  const todayOrderCount = orders.filter((o) => o.status !== "cancelled").length;

  return (
    <OrderContext.Provider
      value={{ orders, addOrder, advanceStatus, todayRevenue, todayOrderCount }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
