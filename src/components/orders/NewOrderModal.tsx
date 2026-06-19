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

  const filtered = mockMenuItems.filter((m) => m.available && (category === "ทั้งหมด" || m.category === category));

  function addToCart(item: MenuItem) {
    setCart((prev) => { const e = prev.find((c) => c.item.id === item.id); return e ? prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { item, qty: 1 }]; });
  }
  function removeFromCart(id: string) {
    setCart((prev) => prev.flatMap((c) => { if (c.item.id !== id) return [c]; return c.qty > 1 ? [{ ...c, qty: c.qty - 1 }] : []; }));
  }
  const total = cart.reduce((s, c) => s + c.item.price * c.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-3xl flex flex-col overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" style={{ maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between shrink-0">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">🍽️ ออเดอร์ใหม่</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          <div style={{ borderRight: "1px solid var(--border)" }} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div style={{ borderBottom: "1px solid var(--border)" }} className="p-3 md:p-4 flex gap-2 shrink-0 flex-wrap">
              {(["dine-in", "takeaway", "delivery"] as OrderType[]).map((t) => (
                <button key={t} onClick={() => setOrderType(t)}
                  style={orderType === t ? { background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid var(--blue-border)" } : { background: "var(--bg-deep)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
                  {t === "dine-in" ? "🪑 Dine-in" : t === "takeaway" ? "🛍️ Takeaway" : "🛵 Delivery"}
                </button>
              ))}
              {orderType === "dine-in"
                ? <input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="เลขโต๊ะ" className="input-styled text-xs py-1.5 w-20" />
                : <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="ชื่อลูกค้า" className="input-styled text-xs py-1.5 w-28" />}
            </div>

            <div style={{ borderBottom: "1px solid var(--border)" }} className="px-3 md:px-4 py-2 flex gap-2 overflow-x-auto shrink-0">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={category === cat ? { background: "var(--blue-bg)", color: "var(--blue)" } : { color: "var(--text-muted)" }}
                  className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap shrink-0 transition-all">{cat}</button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 grid grid-cols-2 gap-2">
              {filtered.map((item) => {
                const inCart = cart.find((c) => c.item.id === item.id);
                return (
                  <button key={item.id} onClick={() => addToCart(item)}
                    style={{ background: inCart ? "var(--blue-bg)" : "var(--bg-deep)", border: inCart ? "1px solid var(--blue-border)" : "1px solid var(--border)" }}
                    className="rounded-xl p-3 text-left transition-all active:scale-[0.98]">
                    <div style={{ color: "var(--text-primary)" }} className="text-xs md:text-sm font-medium">{item.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span style={{ color: "var(--blue)" }} className="text-xs md:text-sm font-bold">฿{item.price}</span>
                      {inCart && <span style={{ background: "var(--blue-grad)", color: "#fff" }} className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{inCart.qty}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full md:w-56 flex flex-col" style={{ background: "var(--bg-deep)" }}>
            <div style={{ borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }} className="p-3 md:p-4 font-semibold text-sm shrink-0 flex items-center gap-2">
              🛒 รายการ <span style={{ background: "var(--blue-bg)", color: "var(--blue)" }} className="text-xs px-2 py-0.5 rounded-full">{cart.reduce((s, c) => s + c.qty, 0)}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 max-h-40 md:max-h-none">
              {cart.length === 0 && <p style={{ color: "var(--text-dim)" }} className="text-xs text-center py-6">ยังไม่มีรายการ</p>}
              {cart.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div style={{ color: "var(--text-primary)" }} className="text-xs truncate">{item.name}</div>
                    <div style={{ color: "var(--text-dim)" }} className="text-xs">฿{item.price}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => removeFromCart(item.id)} style={{ background: "var(--border)", color: "var(--text-secondary)" }} className="w-5 h-5 rounded text-xs font-bold">−</button>
                    <span style={{ color: "var(--text-primary)" }} className="text-xs w-4 text-center">{qty}</span>
                    <button onClick={() => addToCart(item)} style={{ background: "var(--blue-bg)", color: "var(--blue)" }} className="w-5 h-5 rounded text-xs font-bold">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)" }} className="p-3 md:p-4 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }} className="text-sm">รวม</span>
                <span style={{ color: "var(--text-primary)" }} className="font-bold">฿{total.toLocaleString()}</span>
              </div>
              <button disabled={cart.length === 0}
                onClick={() => { onSubmit({ id: `ORD-${Date.now()}`, type: orderType, status: "pending", tableNumber: orderType === "dine-in" && tableNumber ? Number(tableNumber) : undefined, customerName: orderType !== "dine-in" ? customerName || undefined : undefined, items: cart.map((c) => ({ menuItem: c.item, quantity: c.qty })), total, createdAt: new Date() }); }}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${cart.length > 0 ? "btn-primary" : ""}`}
                style={cart.length === 0 ? { background: "var(--border)", color: "var(--text-dim)" } : undefined}>
                ส่งออเดอร์
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
