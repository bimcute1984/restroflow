"use client";

import { Order, OrderStatus } from "@/types";

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "รอรับออเดอร์", color: "#e5c07b", bg: "#2a2010" },
  preparing: { label: "กำลังทำ", color: "#61afef", bg: "#1e2d4a" },
  ready: { label: "พร้อมเสิร์ฟ", color: "#98c379", bg: "#1e2a1e" },
  completed: { label: "เสร็จสิ้น", color: "#636d83", bg: "#1a1d27" },
  cancelled: { label: "ยกเลิก", color: "#e06c75", bg: "#2a1a1a" },
};

const actionLabel: Partial<Record<OrderStatus, { label: string; color: string; bg: string }>> = {
  pending: { label: "รับออเดอร์", color: "#61afef", bg: "#1e2d4a" },
  preparing: { label: "พร้อมเสิร์ฟ", color: "#98c379", bg: "#1e2a1e" },
  ready: { label: "เสร็จสิ้น", color: "#e5c07b", bg: "#2a2010" },
};

function timeAgo(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "เมื่อกี้";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  return `${Math.floor(mins / 60)} ชม. ที่แล้ว`;
}

export default function OrderCard({
  order,
  onAdvance,
}: {
  order: Order;
  onAdvance?: () => void;
}) {
  const status = statusConfig[order.status];
  const action = actionLabel[order.status];

  return (
    <div
      style={{ background: "#1a1d27", border: "1.5px solid #2d3141" }}
      className="rounded-2xl p-4 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-white font-bold text-base">
            {order.type === "dine-in"
              ? `โต๊ะ ${order.tableNumber}`
              : order.customerName || "Takeaway"}
          </div>
          <div style={{ color: "#636d83" }} className="text-xs mt-0.5">
            {order.id} · {timeAgo(order.createdAt)}
          </div>
        </div>
        <span
          style={{ background: status.bg, color: status.color }}
          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
        >
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <span style={{ color: "#abb2bf" }} className="text-sm">
              {item.menuItem.name}
            </span>
            <span style={{ color: "#636d83" }} className="text-sm">
              ×{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{ borderTop: "1px solid #2d3141" }}
        className="pt-3 flex items-center justify-between"
      >
        <span style={{ color: "#abb2bf" }} className="text-sm font-semibold">
          ฿{order.total.toLocaleString()}
        </span>
        {action && (
          <button
            onClick={onAdvance}
            style={{ background: action.bg, color: action.color }}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
