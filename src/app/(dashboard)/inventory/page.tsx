"use client";

import { useState } from "react";
import { mockInventory } from "@/lib/mock-data";
import { InventoryItem } from "@/types";
import ReceiveStockModal from "@/components/inventory/ReceiveStockModal";
import EditInventoryModal from "@/components/inventory/EditInventoryModal";

function StockBar({ item }: { item: InventoryItem }) {
  const pct = Math.min((item.currentStock / (item.minStock * 2)) * 100, 100);
  const low = item.currentStock < item.minStock;
  const color = low ? "#e06c75" : item.currentStock < item.minStock * 1.5 ? "#e5c07b" : "#98c379";
  return (
    <div style={{ background: "#2d3141" }} className="w-full h-1.5 rounded-full overflow-hidden">
      <div style={{ width: `${pct}%`, background: color }} className="h-full rounded-full transition-all" />
    </div>
  );
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(mockInventory);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "ok">("all");
  const [showReceive, setShowReceive] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const isLow = item.currentStock < item.minStock;
    if (filter === "low") return matchSearch && isLow;
    if (filter === "ok") return matchSearch && !isLow;
    return matchSearch;
  });

  const lowCount = items.filter((i) => i.currentStock < i.minStock).length;
  const totalValue = items.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  function receiveStock(itemId: string, amount: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? { ...i, currentStock: Math.round((i.currentStock + amount) * 10) / 10 }
          : i
      )
    );
    setShowReceive(false);
  }

  function saveItem(updated: InventoryItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditItem(null);
  }

  return (
    <>
      {showReceive && (
        <ReceiveStockModal
          items={items}
          onClose={() => setShowReceive(false)}
          onSubmit={receiveStock}
        />
      )}
      {editItem && (
        <EditInventoryModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={saveItem}
        />
      )}

      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">สต๊อกวัตถุดิบ</h1>
            <p style={{ color: "#636d83" }} className="text-sm mt-1">Inventory Management</p>
          </div>
          <button
            onClick={() => setShowReceive(true)}
            style={{ background: "#1a2a2a", color: "#56b6c2" }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
          >
            + รับของเข้า
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "รายการทั้งหมด", value: items.length, color: "#56b6c2" },
            { label: "สต๊อกต่ำ ⚠️", value: lowCount, color: "#e06c75" },
            { label: "สต๊อกปกติ", value: items.length - lowCount, color: "#98c379" },
            { label: "มูลค่าสต๊อก (฿)", value: `${(totalValue / 1000).toFixed(1)}K`, color: "#e5c07b" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
              className="rounded-xl p-4"
            >
              <div style={{ color: s.color }} className="text-2xl font-bold">{s.value}</div>
              <div style={{ color: "#636d83" }} className="text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter + Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2">
            {(["all", "low", "ok"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={filter === f
                  ? { background: "#1a2a2a", color: "#56b6c2" }
                  : { color: "#636d83" }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                {f === "all" ? "ทั้งหมด" : f === "low" ? "⚠️ สต๊อกต่ำ" : "✓ ปกติ"}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาวัตถุดิบ..."
            style={{ background: "#1a1d27", border: "1px solid #2d3141", color: "#fff" }}
            className="text-sm px-3 py-1.5 rounded-xl w-48 outline-none"
          />
        </div>

        {/* Table */}
        <div
          style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
          className="rounded-2xl overflow-hidden"
        >
          {/* Table header */}
          <div
            style={{ borderBottom: "1px solid #2d3141", background: "#0f1117", color: "#636d83" }}
            className="grid grid-cols-12 px-4 py-3 text-xs font-semibold"
          >
            <div className="col-span-4">วัตถุดิบ</div>
            <div className="col-span-2 text-right">คงเหลือ</div>
            <div className="col-span-2 text-right">ขั้นต่ำ</div>
            <div className="col-span-3">สต๊อก</div>
            <div className="col-span-1 text-right">จัดการ</div>
          </div>

          {/* Rows */}
          {filtered.map((item, idx) => {
            const low = item.currentStock < item.minStock;
            return (
              <div
                key={item.id}
                style={{
                  borderBottom: idx < filtered.length - 1 ? "1px solid #2d3141" : undefined,
                  background: low ? "#2a1a1a08" : undefined,
                }}
                className="grid grid-cols-12 px-4 py-3.5 items-center"
              >
                <div className="col-span-4 flex items-center gap-2">
                  {low && <span className="text-xs">⚠️</span>}
                  <span className="text-white text-sm font-medium">{item.name}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    style={{ color: low ? "#e06c75" : "#abb2bf" }}
                    className="text-sm font-semibold"
                  >
                    {item.currentStock}
                  </span>
                  <span style={{ color: "#636d83" }} className="text-xs ml-1">{item.unit}</span>
                </div>
                <div className="col-span-2 text-right">
                  <span style={{ color: "#636d83" }} className="text-sm">
                    {item.minStock} {item.unit}
                  </span>
                </div>
                <div className="col-span-3 px-2">
                  <StockBar item={item} />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setEditItem(item)}
                    style={{ background: "#1a2a2a", color: "#56b6c2" }}
                    className="text-xs px-2 py-1 rounded-lg font-semibold"
                  >
                    แก้ไข
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ color: "#636d83" }} className="text-center py-12 text-sm">
              ไม่พบรายการ
            </div>
          )}
        </div>
      </div>
    </>
  );
}
