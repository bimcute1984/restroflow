"use client";

import { useState } from "react";
import { MenuItem, Order, OrderType } from "@/types";
import { mockMenuItems } from "@/lib/mock-data";

const categories = ["ทั้งหมด", ...Array.from(new Set(mockMenuItems.map((m) => m.category)))];

interface CartItem { item: MenuItem; qty: number }

export default function NewOrderModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (order: Order) => void }) {
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [category, setCategory] = useState("ทั้งหมด");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = mockMenuItems.filter(
    (m) => m.available && (category === "ทั้งหมด" || m.category === category)
  );

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.flatMap((c) => {
      if (c.item.id !== id) return [c];
      if (c.qty > 1) return [{ ...c, qty: c.qty - 1 }];
      return [];
    }));
  }

  const total = cart.reduce((s, c) => s + c.item.price * c.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#0008" }}>
      <div
        style={{ background: "#1a1d27", border: "1px solid #2d3141", maxHeight: "90vh" }}
        className="w-full max-w-3xl rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div style={{ borderBottom: "1px solid #2d3141" }} className="p-5 flex items-center justify-between shrink-0">
          <h2 className="text-white font-bold text-lg">ออเดอร์ใหม่</h2>
          <button onClick={onClose} style={{ color: "#636d83" }} className="text-xl font-bold">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left — menu */}
          <div style={{ borderRight: "1px solid #2d3141" }} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Order type + table */}
            <div style={{ borderBottom: "1px solid #2d3141" }} className="p-4 flex gap-2 shrink-0 flex-wrap">
              {(["dine-in", "takeaway", "delivery"] as OrderType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  style={orderType === t
                    ? { background: "#1e2d4a", color: "#61afef" }
                    : { background: "#0f1117", color: "#636d83" }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  {t === "dine-in" ? "🪑 Dine-in" : t === "takeaway" ? "🛍️ Takeaway" : "🛵 Delivery"}
                </button>
              ))}
              {orderType === "dine-in" ? (
                <input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="เลขโต๊ะ"
                  style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
                  className="text-xs px-3 py-1.5 rounded-lg w-20"
                />
              ) : (
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ชื่อลูกค้า"
                  style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
                  className="text-xs px-3 py-1.5 rounded-lg w-28"
                />
              )}
            </div>

            {/* Category filter */}
            <div style={{ borderBottom: "1px solid #2d3141" }} className="px-4 py-2 flex gap-2 overflow-x-auto shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={category === cat
                    ? { background: "#1e2d4a", color: "#61afef" }
                    : { color: "#636d83" }}
                  className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap shrink-0"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu items */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2">
              {filtered.map((item) => {
                const inCart = cart.find((c) => c.item.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    style={{
                      background: inCart ? "#1e2d4a" : "#0f1117",
                      border: inCart ? "1px solid #61afef44" : "1px solid #2d3141",
                    }}
                    className="rounded-xl p-3 text-left transition-all"
                  >
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span style={{ color: "#61afef" }} className="text-sm font-bold">฿{item.price}</span>
                      {inCart && (
                        <span style={{ background: "#61afef", color: "#0f1117" }} className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {inCart.qty}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — cart */}
          <div className="w-full md:w-56 flex flex-col" style={{ background: "#0f1117" }}>
            <div style={{ borderBottom: "1px solid #2d3141" }} className="p-4 text-white font-semibold text-sm shrink-0">
              รายการ ({cart.reduce((s, c) => s + c.qty, 0)})
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {cart.length === 0 && (
                <p style={{ color: "#636d83" }} className="text-xs text-center py-6">ยังไม่มีรายการ</p>
              )}
              {cart.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs truncate">{item.name}</div>
                    <div style={{ color: "#636d83" }} className="text-xs">฿{item.price}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => removeFromCart(item.id)} style={{ background: "#2d3141", color: "#abb2bf" }} className="w-5 h-5 rounded text-xs font-bold">−</button>
                    <span className="text-white text-xs w-4 text-center">{qty}</span>
                    <button onClick={() => addToCart(item)} style={{ background: "#1e2d4a", color: "#61afef" }} className="w-5 h-5 rounded text-xs font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #2d3141" }} className="p-4 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between">
                <span style={{ color: "#abb2bf" }} className="text-sm">รวม</span>
                <span className="text-white font-bold">฿{total.toLocaleString()}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => {
                  const order: Order = {
                    id: `ORD-${Date.now()}`,
                    type: orderType,
                    status: "pending",
                    tableNumber: orderType === "dine-in" && tableNumber ? Number(tableNumber) : undefined,
                    customerName: orderType !== "dine-in" ? customerName || undefined : undefined,
                    items: cart.map((c) => ({ menuItem: c.item, quantity: c.qty })),
                    total,
                    createdAt: new Date(),
                  };
                  onSubmit(order);
                }}
                style={cart.length > 0
                  ? { background: "#61afef", color: "#0f1117" }
                  : { background: "#2d3141", color: "#636d83" }}
                className="w-full py-2.5 rounded-xl text-sm font-bold"
              >
                ส่งออเดอร์
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
