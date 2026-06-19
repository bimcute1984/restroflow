"use client";

import { useState } from "react";
import { mockInventory } from "@/lib/mock-data";
import { InventoryItem } from "@/types";
import ReceiveStockModal from "@/components/inventory/ReceiveStockModal";
import EditInventoryModal from "@/components/inventory/EditInventoryModal";

function StockBar({ item }: { item: InventoryItem }) {
  const pct = Math.min((item.currentStock / (item.minStock * 2)) * 100, 100);
  const low = item.currentStock < item.minStock;
  const color = low ? "var(--red)" : item.currentStock < item.minStock * 1.5 ? "var(--yellow)" : "var(--green)";
  return (
    <div style={{ background: "var(--border)" }} className="w-full h-1.5 rounded-full overflow-hidden">
      <div style={{ width: `${pct}%`, background: color }} className="h-full rounded-full transition-all" />
    </div>
  );
}

function MobileItemCard({ item, onEdit }: { item: InventoryItem; onEdit: () => void }) {
  const low = item.currentStock < item.minStock;
  return (
    <div style={{ background: "var(--bg-card)", border: `1.5px solid ${low ? "var(--red-border)" : "var(--border)"}`, boxShadow: "var(--card-shadow)" }} className="rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {low && <span className="text-xs">⚠️</span>}
          <span style={{ color: "var(--text-primary)" }} className="text-sm font-medium">{item.name}</span>
        </div>
        <button onClick={onEdit} style={{ background: "var(--cyan-bg)", color: "var(--cyan)" }} className="text-[10px] px-2 py-0.5 rounded-lg font-semibold">แก้ไข</button>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: low ? "var(--red)" : "var(--text-secondary)" }} className="font-semibold">{item.currentStock} {item.unit}</span>
        <span style={{ color: "var(--text-dim)" }}>ขั้นต่ำ: {item.minStock} {item.unit}</span>
      </div>
      <StockBar item={item} />
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

  return (
    <>
      {showReceive && <ReceiveStockModal items={items} onClose={() => setShowReceive(false)} onSubmit={(id, amt) => { setItems((prev) => prev.map((i) => i.id === id ? { ...i, currentStock: Math.round((i.currentStock + amt) * 10) / 10 } : i)); setShowReceive(false); }} />}
      {editItem && <EditInventoryModal item={editItem} onClose={() => setEditItem(null)} onSave={(u) => { setItems((prev) => prev.map((i) => (i.id === u.id ? u : i))); setEditItem(null); }} />}

      <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">สต๊อกวัตถุดิบ</h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">Inventory Management</p>
          </div>
          <button onClick={() => setShowReceive(true)} style={{ background: "var(--cyan-grad)", color: "#fff", boxShadow: "0 2px 12px var(--cyan-border)" }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]">
            + <span className="hidden sm:inline">รับของเข้า</span><span className="sm:hidden">รับของ</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {[
            { label: "รายการทั้งหมด", value: items.length, v: "--cyan", icon: "📦" },
            { label: "สต๊อกต่ำ", value: lowCount, v: "--red", icon: "⚠️" },
            { label: "สต๊อกปกติ", value: items.length - lowCount, v: "--green", icon: "✅" },
            { label: "มูลค่าสต๊อก", value: `฿${(totalValue / 1000).toFixed(1)}K`, v: "--yellow", icon: "💰" },
          ].map((s) => (
            <div key={s.label} className="stat-card p-4">
              <div className="glow" style={{ background: `var(${s.v})` }} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div style={{ color: `var(${s.v})` }} className="text-xl md:text-2xl font-bold">{s.value}</div>
                  <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">{s.label}</div>
                </div>
                <span className="text-lg opacity-60">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-wrap animate-fade-in">
          <div className="flex gap-1.5">
            {(["all", "low", "ok"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={filter === f ? { background: "var(--cyan-bg)", color: "var(--cyan)", border: "1px solid var(--cyan-border)" } : { color: "var(--text-muted)", border: "1px solid transparent" }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">
                {f === "all" ? "ทั้งหมด" : f === "low" ? "⚠️ สต๊อกต่ำ" : "✓ ปกติ"}
              </button>
            ))}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาวัตถุดิบ..." className="input-styled text-xs md:text-sm py-1.5 w-40 md:w-48 ml-auto" />
        </div>

        <div className="md:hidden grid grid-cols-2 gap-3 animate-fade-in">
          {filtered.map((item) => <MobileItemCard key={item.id} item={item} onEdit={() => setEditItem(item)} />)}
          {filtered.length === 0 && <div style={{ color: "var(--text-dim)" }} className="col-span-2 text-center py-12 text-sm">ไม่พบรายการ</div>}
        </div>

        <div className="hidden md:block card-glass overflow-hidden animate-fade-in">
          <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-deep)", color: "var(--text-muted)" }} className="grid grid-cols-12 px-4 py-3 text-xs font-semibold">
            <div className="col-span-4">วัตถุดิบ</div><div className="col-span-2 text-right">คงเหลือ</div><div className="col-span-2 text-right">ขั้นต่ำ</div><div className="col-span-3">สต๊อก</div><div className="col-span-1 text-right">จัดการ</div>
          </div>
          {filtered.map((item, idx) => {
            const low = item.currentStock < item.minStock;
            return (
              <div key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : undefined }} className="grid grid-cols-12 px-4 py-3.5 items-center transition-colors hover:bg-[var(--bg-hover)]">
                <div className="col-span-4 flex items-center gap-2">{low && <span className="text-xs">⚠️</span>}<span style={{ color: "var(--text-primary)" }} className="text-sm font-medium">{item.name}</span></div>
                <div className="col-span-2 text-right"><span style={{ color: low ? "var(--red)" : "var(--text-secondary)" }} className="text-sm font-semibold">{item.currentStock}</span><span style={{ color: "var(--text-dim)" }} className="text-xs ml-1">{item.unit}</span></div>
                <div className="col-span-2 text-right"><span style={{ color: "var(--text-dim)" }} className="text-sm">{item.minStock} {item.unit}</span></div>
                <div className="col-span-3 px-2"><StockBar item={item} /></div>
                <div className="col-span-1 flex justify-end"><button onClick={() => setEditItem(item)} style={{ background: "var(--cyan-bg)", color: "var(--cyan)" }} className="text-xs px-2 py-1 rounded-lg font-semibold transition-all hover:brightness-125">แก้ไข</button></div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ color: "var(--text-dim)" }} className="text-center py-12 text-sm">ไม่พบรายการ</div>}
        </div>
      </div>
    </>
  );
}
