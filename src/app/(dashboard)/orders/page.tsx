"use client";

import { useState } from "react";
import OrderCard from "@/components/orders/OrderCard";
import NewOrderModal from "@/components/orders/NewOrderModal";
import { mockOrders } from "@/lib/mock-data";
import { Order, OrderStatus } from "@/types";

const columns: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "รอรับ", color: "#e5c07b" },
  { status: "preparing", label: "กำลังทำ", color: "#61afef" },
  { status: "ready", label: "พร้อมเสิร์ฟ", color: "#98c379" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [showModal, setShowModal] = useState(false);

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

  const stats = {
    total: orders.filter((o) => o.status !== "cancelled").length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  return (
    <>
      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          onSubmit={(order) => {
            setOrders((prev) => [order, ...prev]);
            setShowModal(false);
          }}
        />
      )}

      <div className="p-6 flex flex-col gap-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">ระบบสั่งอาหาร</h1>
            <p style={{ color: "#636d83" }} className="text-sm mt-1">
              Order Management
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ background: "#1e2d4a", color: "#61afef" }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
          >
            + ออเดอร์ใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "ออเดอร์วันนี้", value: stats.total, color: "#61afef" },
            { label: "รอรับ", value: stats.pending, color: "#e5c07b" },
            { label: "กำลังทำ", value: stats.preparing, color: "#61afef" },
            { label: "พร้อมเสิร์ฟ", value: stats.ready, color: "#98c379" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
              className="rounded-xl p-4"
            >
              <div style={{ color: s.color }} className="text-2xl font-bold">
                {s.value}
              </div>
              <div style={{ color: "#636d83" }} className="text-xs mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);
            return (
              <div key={col.status} className="flex flex-col gap-3 min-h-0">
                <div className="flex items-center gap-2">
                  <span style={{ background: col.color }} className="w-2 h-2 rounded-full" />
                  <span className="text-white font-semibold text-sm">{col.label}</span>
                  <span
                    style={{ background: "#2d3141", color: "#636d83" }}
                    className="text-xs px-2 py-0.5 rounded-full ml-auto"
                  >
                    {colOrders.length}
                  </span>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div
                      style={{ border: "1.5px dashed #2d3141", color: "#636d83" }}
                      className="rounded-2xl p-8 text-center text-sm"
                    >
                      ไม่มีออเดอร์
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onAdvance={() => advanceStatus(order.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
