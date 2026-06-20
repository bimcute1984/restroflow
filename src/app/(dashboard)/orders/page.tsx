"use client";

import { useState } from "react";
import OrderCard from "@/components/orders/OrderCard";
import NewOrderModal from "@/components/orders/NewOrderModal";
import CheckoutModal from "@/components/orders/CheckoutModal";
import ReceiptModal from "@/components/orders/ReceiptModal";
import { useOrders } from "@/lib/order-context";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n-context";
import { canCreateOrder } from "@/lib/permissions";
import { Order, OrderStatus, PaymentMethod } from "@/types";

interface ReceiptData {
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

export default function OrdersPage() {
  const { orders, loading, addOrder, advanceStatus, cancelOrder, todayRevenue } = useOrders();
  const { profile } = useAuth();
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<Order | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const showNewOrderBtn = profile ? canCreateOrder(profile.role) : false;

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");

  const columns: { status: OrderStatus; label: string; colorVar: string; icon: string }[] = [
    { status: "pending", label: t.orders.waiting, colorVar: "--yellow", icon: "⏳" },
    { status: "preparing", label: t.orders.preparing, colorVar: "--blue", icon: "🔥" },
    { status: "ready", label: t.orders.ready, colorVar: "--green", icon: "✅" },
  ];

  const stats = {
    total: activeOrders.length,
    pending: activeOrders.filter((o) => o.status === "pending").length,
    preparing: activeOrders.filter((o) => o.status === "preparing").length,
    ready: activeOrders.filter((o) => o.status === "ready").length,
  };

  function handleCheckoutConfirm(result: ReceiptData) {
    if (!checkoutOrder) return;
    advanceStatus(checkoutOrder.id);
    setReceiptOrder(checkoutOrder);
    setReceiptData(result);
    setCheckoutOrder(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full page-bg"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.common.loading}</span></div>;
  }

  return (
    <>
      {showModal && (
        <NewOrderModal
          onClose={() => setShowModal(false)}
          onSubmit={async (order) => { await addOrder(order); setShowModal(false); }}
        />
      )}
      {checkoutOrder && (
        <CheckoutModal
          order={checkoutOrder}
          onClose={() => setCheckoutOrder(null)}
          onConfirm={handleCheckoutConfirm}
        />
      )}
      {receiptOrder && receiptData && (
        <ReceiptModal
          order={receiptOrder}
          receipt={receiptData}
          onClose={() => { setReceiptOrder(null); setReceiptData(null); }}
        />
      )}

      <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 h-full page-bg">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">{t.orders.title}</h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">{t.orders.subtitle}</p>
          </div>
          {showNewOrderBtn && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-xs md:text-sm">
              <span>+</span> <span className="hidden sm:inline">{t.orders.newOrder}</span><span className="sm:hidden">{t.common.add}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {[
            { label: t.orders.todayOrders, value: stats.total, v: "--blue" },
            { label: t.orders.waiting, value: stats.pending, v: "--yellow" },
            { label: t.orders.preparing, value: stats.preparing, v: "--blue" },
            { label: t.orders.todayRevenue, value: `฿${todayRevenue.toLocaleString()}`, v: "--green" },
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
            const colOrders = activeOrders.filter((o) => o.status === col.status);
            return (
              <div key={col.status} className="flex flex-col gap-3 min-h-0 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <span style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">{col.label}</span>
                  <span style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }} className="text-xs px-2 py-0.5 rounded-full ml-auto">{colOrders.length}</span>
                </div>
                <div className="flex flex-col gap-3 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div style={{ border: "1.5px dashed var(--border)", color: "var(--text-dim)" }} className="rounded-2xl p-8 text-center text-sm">{t.orders.noOrders}</div>
                  ) : (
                    colOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onAdvance={() => advanceStatus(order.id)}
                        onCheckout={() => setCheckoutOrder(order)}
                        onCancel={() => cancelOrder(order.id)}
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
