"use client";

import { useState } from "react";
import { InventoryItem } from "@/types";

export default function EditInventoryModal({
  item,
  onClose,
  onSave,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSave: (updated: InventoryItem) => void;
}) {
  const [name, setName] = useState(item.name);
  const [unit, setUnit] = useState(item.unit);
  const [currentStock, setCurrentStock] = useState(item.currentStock);
  const [minStock, setMinStock] = useState(item.minStock);
  const [costPerUnit, setCostPerUnit] = useState(item.costPerUnit);

  function handleSave() {
    onSave({ ...item, name, unit, currentStock, minStock, costPerUnit });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "#0008" }}
    >
      <div
        style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ borderBottom: "1px solid #2d3141" }}
          className="p-5 flex items-center justify-between"
        >
          <h2 className="text-white font-bold text-lg">แก้ไขวัตถุดิบ</h2>
          <button onClick={onClose} style={{ color: "#636d83" }} className="text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <Field label="ชื่อวัตถุดิบ">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            />
          </Field>

          <Field label="หน่วย">
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="สต๊อกปัจจุบัน">
              <input
                type="number"
                value={currentStock}
                min={0}
                step={0.5}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              />
            </Field>
            <Field label="สต๊อกขั้นต่ำ">
              <input
                type="number"
                value={minStock}
                min={0}
                step={0.5}
                onChange={(e) => setMinStock(Number(e.target.value))}
                style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              />
            </Field>
          </div>

          <Field label="ราคา/หน่วย (฿)">
            <input
              type="number"
              value={costPerUnit}
              min={0}
              onChange={(e) => setCostPerUnit(Number(e.target.value))}
              style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            />
          </Field>

          <div className="flex gap-3 mt-1">
            <button
              onClick={onClose}
              style={{ background: "#2d3141", color: "#636d83" }}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !unit.trim()}
              style={
                name.trim() && unit.trim()
                  ? { background: "#1a2a2a", color: "#56b6c2" }
                  : { background: "#2d3141", color: "#636d83" }
              }
              className="flex-1 py-2.5 rounded-xl font-bold text-sm"
            >
              บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ color: "#636d83" }} className="text-xs font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
