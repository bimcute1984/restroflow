"use client";

import { useState } from "react";
import OrderCard from "@/components/orders/OrderCard";
import NewOrderModal from "@/components/orders/NewOrderModal";
import { useOrders } from "@/lib/order-context";
import { useAuth } from "@/lib/auth-context";
import { canCreateOrder } from "@/lib/permissions";
import { OrderStatus } from "@/types";

const columns: { status: OrderStatus; label: string; colorVar: string; icon: string }[] = [
  { status: "pending", label: "รอรับ", colorVar: "--yellow", icon: "⏳" },
  { status: "preparing", label: "กำลังทำ", colorVar: "--blue", icon: "🔥" },
  { status: "ready", label: "พร้อมเสิร์ฟ", colorVar: "--green", icon: "✅" },
];

export default function OrdersPage() {
  const { orders, addOrder, advanceStatus, todayRevenue, todayOrderCount } = useOrders();
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const showNewOrderBtn = profile ? canCreateOrder(profile.role) : false;

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
          onSubmit={(order) => { addOrder(order); setShowModal(false); }}
        />
      )}

      <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 h-full page-bg">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">ระบบสั่งอาหาร</h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">Order Management</p>
          </div>
          {showNewOrderBtn && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-xs md:text-sm">
              <span>+</span> <span className="hidden sm:inline">ออเดอร์ใหม่</span><span className="sm:hidden">เพิ่ม</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {[
            { label: "ออเดอร์วันนี้", value: stats.total, v: "--blue" },
            { label: "รอรับ", value: stats.pending, v: "--yellow" },
            { label: "กำลังทำ", value: stats.preparing, v: "--blue" },
            { label: "รายได้วันนี้", value: `฿${todayRevenue.toLocaleString()}`, v: "--green" },
          ].map((s) => (
            <div key={s.label} className="stat-card p-4">
              <div className="glow" style={{ background: `var(${s.v})` }} />
              <div style={{ color: `var(${s.v})` }} className="text-xl md:text-2xl font-bold relative z-10">{s.value}</div>
              <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1 relative z-10">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.status);
            return (
              <div key={col.status} className="flex flex-col gap-3 min-h-0 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <span style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">{col.label}</span>
                  <span style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }} className="text-xs px-2 py-0.5 rounded-full ml-auto">{colOrders.length}</span>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div style={{ border: "1.5px dashed var(--border)", color: "var(--text-dim)" }} className="rounded-2xl p-8 text-center text-sm">ไม่มีออเดอร์</div>
                  ) : (
                    colOrders.map((order) => <OrderCard key={order.id} order={order} onAdvance={() => advanceStatus(order.id)} />)
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
