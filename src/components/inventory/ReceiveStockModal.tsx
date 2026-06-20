"use client";

import { useState } from "react";
import { InventoryItem } from "@/types";
import { useI18n } from "@/lib/i18n-context";

export default function ReceiveStockModal({ items, onClose, onSubmit }: { items: InventoryItem[]; onClose: () => void; onSubmit: (itemId: string, amount: number) => void }) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [amount, setAmount] = useState(1);
  const selected = items.find((i) => i.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-sm overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">📦 {t.inventory.receiveModal.title}</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="p-4 md:p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.inventory.receiveModal.material}</label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="input-styled w-full py-2.5">
              {items.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.currentStock} {item.unit} {t.inventory.receiveModal.remaining})</option>)}
            </select>
          </div>
          {selected && (
            <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl p-3 flex items-center justify-between">
              <span style={{ color: "var(--text-muted)" }} className="text-xs">{t.inventory.receiveModal.currentStock}</span>
              <span style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">{selected.currentStock} {selected.unit}</span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.inventory.receiveModal.receiveAmount} {selected && `(${selected.unit})`}</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setAmount((a) => Math.max(0.5, a - (a > 1 ? 1 : 0.5)))} style={{ background: "var(--border)", color: "var(--text-secondary)" }} className="w-10 h-10 rounded-xl font-bold text-lg shrink-0">−</button>
              <input type="number" value={amount} min={0.1} step={0.5} onChange={(e) => setAmount(Math.max(0.1, Number(e.target.value)))} className="input-styled flex-1 text-center py-2.5 text-lg font-bold" />
              <button onClick={() => setAmount((a) => a + 1)} style={{ background: "var(--cyan-bg)", color: "var(--cyan)" }} className="w-10 h-10 rounded-xl font-bold text-lg shrink-0">+</button>
            </div>
          </div>
          {selected && (
            <div style={{ background: "var(--cyan-bg)", border: "1px solid var(--cyan-border)" }} className="rounded-xl p-3 flex items-center justify-between">
              <span style={{ color: "var(--text-muted)" }} className="text-xs">{t.inventory.receiveModal.afterReceive}</span>
              <span style={{ color: "var(--cyan)" }} className="font-bold text-sm">{(selected.currentStock + amount).toFixed(1)} {selected.unit}</span>
            </div>
          )}
          <button onClick={() => { if (selectedId && amount > 0) onSubmit(selectedId, amount); }} disabled={!selectedId || amount <= 0}
            style={selectedId && amount > 0 ? { background: "var(--cyan-grad)", color: "#fff", boxShadow: "0 2px 12px var(--cyan-border)" } : { background: "var(--border)", color: "var(--text-dim)" }}
            className="w-full py-3 rounded-xl font-bold text-sm mt-1 transition-all">{t.inventory.receiveModal.save}</button>
        </div>
      </div>
    </div>
  );
}
