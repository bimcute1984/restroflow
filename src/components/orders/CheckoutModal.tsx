"use client";

import { useState } from "react";
import { Order, PaymentMethod } from "@/types";
import { useI18n } from "@/lib/i18n-context";
import { localizedName } from "@/lib/menu-i18n";

const PAYMENT_METHODS: { key: PaymentMethod; icon: string; labelKey: keyof typeof LABEL_MAP }[] = [
  { key: "cash", icon: "💵", labelKey: "cash" },
  { key: "promptpay", icon: "📱", labelKey: "promptpay" },
  { key: "credit_card", icon: "💳", labelKey: "creditCard" },
  { key: "line_pay", icon: "🟢", labelKey: "linePay" },
  { key: "true_money", icon: "🔴", labelKey: "trueMoney" },
];
const LABEL_MAP = { cash: 1, promptpay: 1, creditCard: 1, linePay: 1, trueMoney: 1 };

interface CheckoutResult {
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

export default function CheckoutModal({ order, onClose, onConfirm }: {
  order: Order;
  onClose: () => void;
  onConfirm: (result: CheckoutResult) => void;
}) {
  const { t, locale } = useI18n();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount, setDiscount] = useState(0);
  const [received, setReceived] = useState("");
  const [processing, setProcessing] = useState(false);

  const subtotal = order.total;
  const afterDiscount = Math.max(subtotal - discount, 0);
  const tax = Math.round(afterDiscount * 0.07);
  const grandTotal = afterDiscount + tax;
  const receivedAmount = Number(received) || 0;
  const change = paymentMethod === "cash" ? Math.max(receivedAmount - grandTotal, 0) : 0;
  const canPay = paymentMethod === "cash" ? receivedAmount >= grandTotal : true;

  async function handlePay() {
    if (!canPay) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm({ paymentMethod, subtotal, discount, tax, grandTotal });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-md flex flex-col overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between shrink-0">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">💰 {t.orders.checkout.title}</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 md:p-5 flex flex-col gap-4">
          {/* Order summary */}
          <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl p-3">
            <div style={{ color: "var(--text-muted)" }} className="text-xs font-semibold mb-2">
              {order.type === "dine-in" ? `🪑 ${t.orders.table} ${order.tableNumber}` : `🛍️ ${order.customerName || "Takeaway"}`}
            </div>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs py-1">
                <span style={{ color: "var(--text-secondary)" }}>{localizedName(item.menuItem, locale)} ×{item.quantity}</span>
                <span style={{ color: "var(--text-primary)" }} className="font-medium">฿{(item.menuItem.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Discount */}
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.orders.checkout.discount}</label>
            <div className="flex gap-2">
              {[0, 10, 20, 50].map((d) => (
                <button key={d} onClick={() => setDiscount(d)}
                  style={discount === d ? { background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" } : { background: "var(--bg-deep)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all">
                  {d === 0 ? "-" : `฿${d}`}
                </button>
              ))}
              <input
                type="number"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder={t.orders.checkout.discountPlaceholder}
                className="input-styled text-xs py-1.5 w-20"
                min={0}
              />
            </div>
          </div>

          {/* Totals */}
          <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--text-muted)" }}>{t.orders.checkout.subtotal}</span>
              <span style={{ color: "var(--text-primary)" }}>฿{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--green)" }}>{t.orders.checkout.discount}</span>
                <span style={{ color: "var(--green)" }}>-฿{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span style={{ color: "var(--text-muted)" }}>{t.orders.checkout.tax}</span>
              <span style={{ color: "var(--text-primary)" }}>฿{tax.toLocaleString()}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)" }} className="pt-2 flex justify-between">
              <span style={{ color: "var(--text-primary)" }} className="font-bold text-sm">{t.orders.checkout.grandTotal}</span>
              <span style={{ color: "var(--blue)" }} className="font-bold text-lg">฿{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.orders.checkout.paymentMethod}</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                  style={paymentMethod === pm.key
                    ? { background: "var(--blue-bg)", color: "var(--blue)", border: "1.5px solid var(--blue-border)" }
                    : { background: "var(--bg-deep)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all">
                  <span className="text-lg">{pm.icon}</span>
                  {t.orders.checkout[pm.labelKey]}
                </button>
              ))}
            </div>
          </div>

          {/* Cash received */}
          {paymentMethod === "cash" && (
            <div className="flex flex-col gap-1.5">
              <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.orders.checkout.received}</label>
              <input
                type="number"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                placeholder={t.orders.checkout.receivedPlaceholder}
                className="input-styled w-full py-2.5"
                min={0}
              />
              {receivedAmount > 0 && receivedAmount >= grandTotal && (
                <div className="flex justify-between items-center px-3 py-2 rounded-xl" style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)" }}>
                  <span style={{ color: "var(--green)" }} className="text-xs font-semibold">{t.orders.checkout.change}</span>
                  <span style={{ color: "var(--green)" }} className="font-bold">฿{change.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pay button */}
        <div style={{ borderTop: "1px solid var(--border)" }} className="p-4 md:p-5 shrink-0">
          <button
            onClick={handlePay}
            disabled={processing || !canPay}
            style={!processing && canPay
              ? { background: "var(--green-grad)", color: "#fff", boxShadow: "0 2px 12px var(--green-border)" }
              : { background: "var(--border)", color: "var(--text-dim)" }}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
          >
            {processing ? t.orders.checkout.processing : `${t.orders.checkout.pay} ฿${grandTotal.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
