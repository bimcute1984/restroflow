"use client";

import { useState } from "react";
import { InventoryItem } from "@/types";

export default function ReceiveStockModal({
  items,
  onClose,
  onSubmit,
}: {
  items: InventoryItem[];
  onClose: () => void;
  onSubmit: (itemId: string, amount: number) => void;
}) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [amount, setAmount] = useState(1);

  const selected = items.find((i) => i.id === selectedId);

  function handleSubmit() {
    if (!selectedId || amount <= 0) return;
    onSubmit(selectedId, amount);
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
          <h2 className="text-white font-bold text-lg">รับของเข้า</h2>
          <button onClick={onClose} style={{ color: "#636d83" }} className="text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Select item */}
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "#636d83" }} className="text-xs font-semibold">
              วัตถุดิบ
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                background: "#0f1117",
                border: "1px solid #2d3141",
                color: "#fff",
              }}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.currentStock} {item.unit} คงเหลือ)
                </option>
              ))}
            </select>
          </div>

          {/* Current stock info */}
          {selected && (
            <div
              style={{ background: "#0f1117", border: "1px solid #2d3141" }}
              className="rounded-xl p-3 flex items-center justify-between"
            >
              <span style={{ color: "#636d83" }} className="text-xs">สต๊อกปัจจุบัน</span>
              <span className="text-white font-semibold text-sm">
                {selected.currentStock} {selected.unit}
              </span>
            </div>
          )}

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "#636d83" }} className="text-xs font-semibold">
              จำนวนที่รับเข้า {selected && `(${selected.unit})`}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAmount((a) => Math.max(0.5, a - (a > 1 ? 1 : 0.5)))}
                style={{ background: "#2d3141", color: "#abb2bf" }}
                className="w-10 h-10 rounded-xl font-bold text-lg shrink-0"
              >
                −
              </button>
              <input
                type="number"
                value={amount}
                min={0.1}
                step={0.5}
                onChange={(e) => setAmount(Math.max(0.1, Number(e.target.value)))}
                style={{
                  background: "#0f1117",
                  border: "1px solid #2d3141",
                  color: "#fff",
                }}
                className="flex-1 text-center py-2.5 rounded-xl text-lg font-bold outline-none"
              />
              <button
                onClick={() => setAmount((a) => a + 1)}
                style={{ background: "#1a2a2a", color: "#56b6c2" }}
                className="w-10 h-10 rounded-xl font-bold text-lg shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* After stock preview */}
          {selected && (
            <div
              style={{ background: "#1a2a2a", border: "1px solid #56b6c244" }}
              className="rounded-xl p-3 flex items-center justify-between"
            >
              <span style={{ color: "#636d83" }} className="text-xs">สต๊อกหลังรับ</span>
              <span style={{ color: "#56b6c2" }} className="font-bold text-sm">
                {(selected.currentStock + amount).toFixed(1)} {selected.unit}
              </span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedId || amount <= 0}
            style={
              selectedId && amount > 0
                ? { background: "#1a2a2a", color: "#56b6c2" }
                : { background: "#2d3141", color: "#636d83" }
            }
            className="w-full py-3 rounded-xl font-bold text-sm mt-1"
          >
            บันทึกการรับของ
          </button>
        </div>
      </div>
    </div>
  );
}
