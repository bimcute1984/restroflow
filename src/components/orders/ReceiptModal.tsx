"use client";

import { useRef } from "react";
import { Order, PaymentMethod } from "@/types";
import { useI18n } from "@/lib/i18n-context";
import { localizedName } from "@/lib/menu-i18n";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: "💵 Cash",
  promptpay: "📱 PromptPay",
  credit_card: "💳 Credit Card",
  line_pay: "🟢 LINE Pay",
  true_money: "🔴 TrueMoney",
};

interface ReceiptData {
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
}

export default function ReceiptModal({ order, receipt, onClose }: {
  order: Order;
  receipt: ReceiptData;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (!printRef.current) return;
    const win = window.open("", "_blank", "width=300,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: monospace; font-size: 12px; padding: 10px; max-width: 280px; margin: 0 auto; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        @media print { body { margin: 0; padding: 5px; } }
      </style></head><body>
      ${printRef.current.innerHTML}
      <script>window.print(); window.close();</script>
      </body></html>
    `);
    win.document.close();
  }

  const date = new Date();
  const dateStr = date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
  const timeStr = date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-sm flex flex-col overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between shrink-0">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">🧾 {t.orders.receipt.title}</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 md:p-5">
          {/* Visual receipt */}
          <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl p-4 font-mono text-xs">
            <div ref={printRef}>
              <div className="center bold" style={{ color: "var(--text-primary)", textAlign: "center", fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>restroflow</div>
              <div style={{ color: "var(--text-dim)", textAlign: "center", fontSize: "10px", marginBottom: "8px" }}>{t.orders.receipt.title}</div>

              <div style={{ borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

              <div className="flex justify-between" style={{ color: "var(--text-muted)" }}>
                <span>{t.orders.receipt.orderNumber}</span>
                <span style={{ color: "var(--text-primary)" }}>{order.id}</span>
              </div>
              <div className="flex justify-between" style={{ color: "var(--text-muted)" }}>
                <span>{t.orders.receipt.date}</span>
                <span style={{ color: "var(--text-primary)" }}>{dateStr} {timeStr}</span>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between" style={{ color: "var(--text-muted)" }}>
                  <span>{t.orders.table}</span>
                  <span style={{ color: "var(--text-primary)" }}>{order.tableNumber}</span>
                </div>
              )}

              <div style={{ borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

              {/* Items header */}
              <div className="flex justify-between" style={{ color: "var(--text-muted)", fontWeight: "bold", marginBottom: "4px" }}>
                <span className="flex-1">{t.orders.receipt.items}</span>
                <span className="w-8 text-right">{t.orders.receipt.qty}</span>
                <span className="w-16 text-right">{t.orders.receipt.amount}</span>
              </div>

              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-0.5" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex-1 truncate">{localizedName(item.menuItem, locale)}</span>
                  <span className="w-8 text-right">{item.quantity}</span>
                  <span className="w-16 text-right" style={{ color: "var(--text-primary)" }}>฿{(item.menuItem.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div style={{ borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

              <div className="flex justify-between py-0.5" style={{ color: "var(--text-muted)" }}>
                <span>{t.orders.receipt.subtotal}</span>
                <span style={{ color: "var(--text-primary)" }}>฿{receipt.subtotal.toLocaleString()}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between py-0.5" style={{ color: "var(--green)" }}>
                  <span>{t.orders.receipt.discount}</span>
                  <span>-฿{receipt.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-0.5" style={{ color: "var(--text-muted)" }}>
                <span>{t.orders.receipt.tax}</span>
                <span style={{ color: "var(--text-primary)" }}>฿{receipt.tax.toLocaleString()}</span>
              </div>

              <div style={{ borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

              <div className="flex justify-between" style={{ fontWeight: "bold", fontSize: "14px" }}>
                <span style={{ color: "var(--text-primary)" }}>{t.orders.receipt.total}</span>
                <span style={{ color: "var(--blue)" }}>฿{receipt.grandTotal.toLocaleString()}</span>
              </div>

              <div style={{ borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

              <div className="flex justify-between py-0.5" style={{ color: "var(--text-muted)" }}>
                <span>{t.orders.receipt.paymentMethod}</span>
                <span style={{ color: "var(--text-primary)" }}>{PAYMENT_LABELS[receipt.paymentMethod]}</span>
              </div>

              <div style={{ borderTop: "1px dashed var(--border)", margin: "12px 0 8px" }} />

              <div style={{ color: "var(--text-dim)", textAlign: "center", fontSize: "10px" }}>
                {t.orders.receipt.thankYou}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)" }} className="p-4 md:p-5 flex gap-3 shrink-0">
          <button onClick={onClose} style={{ background: "var(--border)", color: "var(--text-muted)" }} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-125">{t.orders.receipt.close}</button>
          <button onClick={handlePrint} style={{ background: "var(--blue-grad)", color: "#fff", boxShadow: "0 2px 12px var(--blue-border)" }} className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all">🖨️ {t.orders.receipt.print}</button>
        </div>
      </div>
    </div>
  );
}
