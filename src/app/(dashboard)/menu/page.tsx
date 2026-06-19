"use client";

import { useState } from "react";
import { mockCategories, mockMenuFull } from "@/lib/mock-data";
import { MenuItemFull } from "@/types";
import MenuItemModal from "@/components/menu/MenuItemModal";

const categoryEmoji: Record<string, string> = { "เครื่องดื่ม": "🥤", "ซุป": "🍲", "แกง": "🍛", "ยำ/สลัด": "🥗", "ของหวาน": "🍮", "เครื่องเคียง": "🍚", "อาหารจานหลัก": "🍽️" };

function MenuItemCard({ item, onToggle, onEdit }: { item: MenuItemFull; onToggle: (id: string) => void; onEdit: (item: MenuItemFull) => void }) {
  const emoji = categoryEmoji[item.category] || "🍽️";
  return (
    <div style={{ background: "var(--bg-card)", border: `1.5px solid ${item.available ? "var(--border)" : "var(--red-border)"}`, opacity: item.available ? 1 : 0.6, boxShadow: "var(--card-shadow)" }} className="rounded-2xl p-3 md:p-4 flex flex-col gap-2 md:gap-3 transition-all hover:translate-y-[-2px]">
      <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl h-20 md:h-28 flex items-center justify-center">
        <span className="text-3xl md:text-4xl">{emoji}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-1 md:gap-2">
          <span style={{ color: "var(--text-primary)" }} className="font-semibold text-xs md:text-sm">{item.name}</span>
          {item.featured && <span style={{ background: "var(--yellow-bg)", color: "var(--yellow)", border: "1px solid var(--yellow-border)" }} className="text-[10px] px-1.5 md:px-2 py-0.5 rounded-full shrink-0">⭐</span>}
        </div>
        {item.description && <p style={{ color: "var(--text-dim)" }} className="text-[10px] md:text-xs mt-1 line-clamp-2">{item.description}</p>}
      </div>
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--blue)" }} className="font-bold text-sm md:text-base">฿{item.price}</span>
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={() => onToggle(item.id)} style={item.available ? { background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" } : { background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }} className="text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg transition-all">{item.available ? "เปิด" : "ปิด"}</button>
          <button onClick={() => onEdit(item)} style={{ background: "var(--border)", color: "var(--text-secondary)" }} className="text-[10px] md:text-xs px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg font-semibold transition-all hover:brightness-125">แก้ไข</button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItemFull[]>(mockMenuFull);
  const [selectedCat, setSelectedCat] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState<MenuItemFull | null | "new">(null);

  function toggleAvailable(id: string) { setItems((prev) => prev.map((item) => item.id === id ? { ...item, available: !item.available } : item)); }
  function saveItem(updated: MenuItemFull) { setItems((prev) => { const exists = prev.find((i) => i.id === updated.id); return exists ? prev.map((i) => (i.id === updated.id ? updated : i)) : [updated, ...prev]; }); setModalItem(null); }

  const categories = ["ทั้งหมด", ...mockCategories.map((c) => c.name)];
  const filtered = items.filter((item) => (selectedCat === "ทั้งหมด" || item.category === selectedCat) && item.name.toLowerCase().includes(search.toLowerCase()));
  const stats = { total: items.length, available: items.filter((i) => i.available).length, featured: items.filter((i) => i.featured).length, unavailable: items.filter((i) => !i.available).length };

  return (
    <>
      {modalItem !== null && <MenuItemModal item={modalItem === "new" ? undefined : modalItem} categories={mockCategories} onClose={() => setModalItem(null)} onSave={saveItem} />}

      <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">จัดการเมนู</h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">Menu Management</p>
          </div>
          <button onClick={() => setModalItem("new")} style={{ background: "var(--red-grad)", color: "#fff", boxShadow: "0 2px 12px var(--red-border)" }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]">
            + <span className="hidden sm:inline">เพิ่มเมนูใหม่</span><span className="sm:hidden">เพิ่มเมนู</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {[
            { label: "เมนูทั้งหมด", value: stats.total, v: "--red", icon: "📋" },
            { label: "เปิดขาย", value: stats.available, v: "--green", icon: "✅" },
            { label: "ปิดขาย", value: stats.unavailable, v: "--text-muted", icon: "🚫" },
            { label: "เมนูแนะนำ", value: stats.featured, v: "--yellow", icon: "⭐" },
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
          <div className="flex gap-1 md:gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCat(cat)}
                style={selectedCat === cat ? { background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" } : { color: "var(--text-muted)", border: "1px solid transparent" }}
                className="text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg transition-all">{cat}</button>
            ))}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาเมนู..." className="input-styled text-xs md:text-sm py-1.5 w-36 md:w-44 ml-auto" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 animate-fade-in">
          {filtered.map((item) => <MenuItemCard key={item.id} item={item} onToggle={toggleAvailable} onEdit={(i) => setModalItem(i)} />)}
          {filtered.length === 0 && <div style={{ color: "var(--text-dim)" }} className="col-span-full text-center py-16 text-sm">ไม่พบเมนู</div>}
        </div>
      </div>
    </>
  );
}
