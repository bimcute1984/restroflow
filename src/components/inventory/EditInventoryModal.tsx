"use client";

import { useState } from "react";
import { InventoryItem } from "@/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{label}</label>{children}</div>;
}

export default function EditInventoryModal({ item, onClose, onSave }: { item: InventoryItem; onClose: () => void; onSave: (updated: InventoryItem) => void }) {
  const [name, setName] = useState(item.name);
  const [unit, setUnit] = useState(item.unit);
  const [currentStock, setCurrentStock] = useState(item.currentStock);
  const [minStock, setMinStock] = useState(item.minStock);
  const [costPerUnit, setCostPerUnit] = useState(item.costPerUnit);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-sm overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">✏️ แก้ไขวัตถุดิบ</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="p-4 md:p-5 flex flex-col gap-4">
          <Field label="ชื่อวัตถุดิบ"><input value={name} onChange={(e) => setName(e.target.value)} className="input-styled w-full py-2.5" /></Field>
          <Field label="หน่วย"><input value={unit} onChange={(e) => setUnit(e.target.value)} className="input-styled w-full py-2.5" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="สต๊อกปัจจุบัน"><input type="number" value={currentStock} min={0} step={0.5} onChange={(e) => setCurrentStock(Number(e.target.value))} className="input-styled w-full py-2.5" /></Field>
            <Field label="สต๊อกขั้นต่ำ"><input type="number" value={minStock} min={0} step={0.5} onChange={(e) => setMinStock(Number(e.target.value))} className="input-styled w-full py-2.5" /></Field>
          </div>
          <Field label="ราคา/หน่วย (฿)"><input type="number" value={costPerUnit} min={0} onChange={(e) => setCostPerUnit(Number(e.target.value))} className="input-styled w-full py-2.5" /></Field>
          <div className="flex gap-3 mt-1">
            <button onClick={onClose} style={{ background: "var(--border)", color: "var(--text-muted)" }} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-125">ยกเลิก</button>
            <button onClick={() => { if (name.trim() && unit.trim()) onSave({ ...item, name, unit, currentStock, minStock, costPerUnit }); }} disabled={!name.trim() || !unit.trim()}
              style={name.trim() && unit.trim() ? { background: "var(--cyan-grad)", color: "#fff", boxShadow: "0 2px 12px var(--cyan-border)" } : { background: "var(--border)", color: "var(--text-dim)" }}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all">บันทึก</button>
          </div>
        </div>
      </div>
    </div>
  );
}
