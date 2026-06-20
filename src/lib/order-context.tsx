"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { Order, OrderStatus } from "@/types";
import { fetchOrders, updateOrderStatus, createOrder as dbCreateOrder, cancelOrder as dbCancelOrder, deductStockForOrder } from "./supabase/queries";
import { useRealtimeTable } from "./supabase/realtime";

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = "sine";
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    }, 150);
  } catch {
    // Audio not available
  }
}

interface OrderContextValue {
  orders: Order[];
  loading: boolean;
  addOrder: (order: {
    type: Order["type"];
    tableNumber?: number;
    customerName?: string;
    items: { menuItemId: string; quantity: number; unitPrice: number; note?: string }[];
    total: number;
  }) => Promise<void>;
  advanceStatus: (id: string) => void;
  cancelOrder: (id: string) => Promise<void>;
  todayRevenue: number;
  todayOrderCount: number;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextValue>({
  orders: [],
  loading: true,
  addOrder: async () => {},
  advanceStatus: () => {},
  cancelOrder: async () => {},
  todayRevenue: 0,
  todayOrderCount: 0,
  refreshOrders: async () => {},
});

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const orderCountRef = useRef<number>(-1);

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders();
      const pendingCount = data.filter((o) => o.status === "pending").length;
      if (orderCountRef.current >= 0 && pendingCount > orderCountRef.current) {
        playNotificationSound();
      }
      orderCountRef.current = pendingCount;
      setOrders(data);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useRealtimeTable("Order", load);
  useRealtimeTable("OrderItem", load);

  async function addOrder(order: {
    type: Order["type"];
    tableNumber?: number;
    customerName?: string;
    items: { menuItemId: string; quantity: number; unitPrice: number; note?: string }[];
    total: number;
  }) {
    try {
      await dbCreateOrder(order);
      await load();
    } catch (e) {
      console.error("Failed to create order:", e);
    }
  }

  async function advanceStatus(id: string) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const next: Record<OrderStatus, OrderStatus> = {
      pending: "preparing",
      preparing: "ready",
      ready: "completed",
      completed: "completed",
      cancelled: "cancelled",
    };
    const newStatus = next[order.status];
    if (newStatus === order.status) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );

    try {
      await updateOrderStatus(id, newStatus);
      if (newStatus === "completed") {
        deductStockForOrder(id).catch((e) =>
          console.error("Failed to deduct stock:", e)
        );
      }
    } catch (e) {
      console.error("Failed to update order status:", e);
      await load();
    }
  }

  async function handleCancelOrder(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as const } : o))
    );
    try {
      await dbCancelOrder(id);
    } catch (e) {
      console.error("Failed to cancel order:", e);
      await load();
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
  const completedOrders = todayOrders.filter((o) => o.status === "completed");
  const todayRevenue = completedOrders.reduce((s, o) => s + o.total, 0);
  const todayOrderCount = todayOrders.filter((o) => o.status !== "cancelled").length;

  return (
    <OrderContext.Provider
      value={{ orders, loading, addOrder, advanceStatus, cancelOrder: handleCancelOrder, todayRevenue, todayOrderCount, refreshOrders: load }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
