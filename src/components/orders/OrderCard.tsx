"use client";

import { useState, useEffect } from "react";
import { Order, OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; colorVar: string; bgVar: string; borderVar: string }> = {
  pending: { label: "รอรับออเดอร์", colorVar: "--yellow", bgVar: "--yellow-bg", borderVar: "--yellow-border" },
  preparing: { label: "กำลังทำ", colorVar: "--blue", bgVar: "--blue-bg", borderVar: "--blue-border" },
  ready: { label: "พร้อมเสิร์ฟ", colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border" },
  completed: { label: "เสร็จสิ้น", colorVar: "--text-muted", bgVar: "--bg-card", borderVar: "--border" },
  cancelled: { label: "ยกเลิก", colorVar: "--red", bgVar: "--red-bg", borderVar: "--red-border" },
};

const actionLabel: Partial<Record<OrderStatus, { label: string; gradVar: string }>> = {
  pending: { label: "รับออเดอร์", gradVar: "--blue-grad" },
  preparing: { label: "พร้อมเสิร์ฟ", gradVar: "--green-grad" },
  ready: { label: "เสร็จสิ้น", gradVar: "--yellow-grad" },
};

function timeAgo(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  return `${Math.floor(mins / 60)} ชม. ที่แล้ว`;
}

export default function OrderCard({ order, onAdvance }: { order: Order; onAdvance?: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const status = statusConfig[order.status];
  const action = actionLabel[order.status];

  return (
    <div
      style={{ background: "var(--bg-card)", border: `1.5px solid var(${status.borderVar})`, boxShadow: "var(--card-shadow)" }}
      className="rounded-2xl p-4 flex flex-col gap-3 transition-all hover:translate-y-[-1px] animate-slide-up"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div style={{ color: "var(--text-primary)" }} className="font-bold text-sm md:text-base truncate">
            {order.type === "dine-in" ? `🪑 โต๊ะ ${order.tableNumber}` : order.type === "delivery" ? `🛵 ${order.customerName || "Delivery"}` : `🛍️ ${order.customerName || "Takeaway"}`}
          </div>
          <div style={{ color: "var(--text-dim)" }} className="text-xs mt-0.5">
            {order.id} · {mounted ? timeAgo(order.createdAt) : ""}
          </div>
        </div>
        <span style={{ background: `var(${status.bgVar})`, color: `var(${status.colorVar})`, border: `1px solid var(${status.borderVar})` }} className="text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full shrink-0">
          {status.label}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span style={{ color: "var(--text-secondary)" }} className="text-xs md:text-sm truncate">{item.menuItem.name}</span>
            <span style={{ color: "var(--text-dim)" }} className="text-xs md:text-sm shrink-0 ml-2">×{item.quantity}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "1px solid var(--border)" }} className="pt-3 flex items-center justify-between">
        <span style={{ color: "var(--text-secondary)" }} className="text-sm font-semibold">฿{order.total.toLocaleString()}</span>
        {action && (
          <button onClick={onAdvance} style={{ background: `var(${action.gradVar})`, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:translate-y-[-1px]">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
