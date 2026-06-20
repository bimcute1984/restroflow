"use client";

import { useState } from "react";
import { InventoryItem } from "@/types";
import { useI18n } from "@/lib/i18n-context";

export default function EditInventoryModal({ item, onClose, onSave }: { item?: InventoryItem; onClose: () => void; onSave: (updated: InventoryItem) => void }) {
  const { t } = useI18n();
  const isNew = !item;
  const [name, setName] = useState(item?.name ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "กก.");
  const [currentStock, setCurrentStock] = useState(item?.currentStock ?? 0);
  const [minStock, setMinStock] = useState(item?.minStock ?? 1);
  const [costPerUnit, setCostPerUnit] = useState(item?.costPerUnit ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-sm overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">{isNew ? "➕" : "✏️"} {isNew ? t.inventory.editModal.addTitle : t.inventory.editModal.title}</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="p-4 md:p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.inventory.editModal.name}</label><input value={name} onChange={(e) => setName(e.target.value)} className="input-styled w-full py-2.5" /></div>
          <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.inventory.editModal.unit}</label><input value={unit} onChange={(e) => setUnit(e.target.value)} className="input-styled w-full py-2.5" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.inventory.editModal.currentStock}</label><input type="number" value={currentStock} min={0} step={0.5} onChange={(e) => setCurrentStock(Number(e.target.value))} className="input-styled w-full py-2.5" /></div>
            <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.inventory.editModal.minStock}</label><input type="number" value={minStock} min={0} step={0.5} onChange={(e) => setMinStock(Number(e.target.value))} className="input-styled w-full py-2.5" /></div>
          </div>
          <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.inventory.editModal.costPerUnit}</label><input type="number" value={costPerUnit} min={0} onChange={(e) => setCostPerUnit(Number(e.target.value))} className="input-styled w-full py-2.5" /></div>
          <div className="flex gap-3 mt-1">
            <button onClick={onClose} style={{ background: "var(--border)", color: "var(--text-muted)" }} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-125">{t.common.cancel}</button>
            <button onClick={() => { if (name.trim() && unit.trim()) onSave({ id: item?.id ?? "__new__", name, unit, currentStock, minStock, costPerUnit }); }} disabled={!name.trim() || !unit.trim()}
              style={name.trim() && unit.trim() ? { background: "var(--cyan-grad)", color: "#fff", boxShadow: "0 2px 12px var(--cyan-border)" } : { background: "var(--border)", color: "var(--text-dim)" }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all">{t.common.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
