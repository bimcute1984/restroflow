"use client";

import { useState } from "react";
import { mockCategories, mockMenuFull } from "@/lib/mock-data";
import { MenuItemFull } from "@/types";
import MenuItemModal from "@/components/menu/MenuItemModal";

function MenuItemCard({
  item,
  onToggle,
  onEdit,
}: {
  item: MenuItemFull;
  onToggle: (id: string) => void;
  onEdit: (item: MenuItemFull) => void;
}) {
  return (
    <div
      style={{
        background: "#1a1d27",
        border: `1.5px solid ${item.available ? "#2d3141" : "#e06c7522"}`,
        opacity: item.available ? 1 : 0.6,
      }}
      className="rounded-2xl p-4 flex flex-col gap-3"
    >
      {/* Image placeholder */}
      <div
        style={{ background: "#0f1117", border: "1px dashed #2d3141" }}
        className="rounded-xl h-28 flex items-center justify-center"
      >
        <span className="text-4xl">
          {item.category === "เครื่องดื่ม" ? "🥤" :
           item.category === "ซุป" ? "🍲" :
           item.category === "แกง" ? "🍛" :
           item.category === "ยำ/สลัด" ? "🥗" :
           item.category === "ของหวาน" ? "🍮" : "🍽️"}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-white font-semibold text-sm">{item.name}</span>
          {item.featured && (
            <span
              style={{ background: "#2a2010", color: "#e5c07b" }}
              className="text-xs px-2 py-0.5 rounded-full shrink-0"
            >
              ⭐ แนะนำ
            </span>
          )}
        </div>
        {item.description && (
          <p style={{ color: "#636d83" }} className="text-xs mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span style={{ color: "#61afef" }} className="font-bold text-base">
          ฿{item.price}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(item.id)}
            style={
              item.available
                ? { background: "#1e2a1e", color: "#98c379" }
                : { background: "#2a1a1a", color: "#e06c75" }
            }
            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
          >
            {item.available ? "เปิดขาย" : "ปิดขาย"}
          </button>
          <button
            onClick={() => onEdit(item)}
            style={{ background: "#2d3141", color: "#abb2bf" }}
            className="text-xs px-2.5 py-1 rounded-lg font-semibold"
          >
            แก้ไข
          </button>
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

  function toggleAvailable(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  }

  function saveItem(updated: MenuItemFull) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === updated.id);
      if (exists) return prev.map((i) => (i.id === updated.id ? updated : i));
      return [updated, ...prev];
    });
    setModalItem(null);
  }

  const categories = ["ทั้งหมด", ...mockCategories.map((c) => c.name)];

  const filtered = items.filter((item) => {
    const matchCat = selectedCat === "ทั้งหมด" || item.category === selectedCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: items.length,
    available: items.filter((i) => i.available).length,
    featured: items.filter((i) => i.featured).length,
    unavailable: items.filter((i) => !i.available).length,
  };

  return (
    <>
      {modalItem !== null && (
        <MenuItemModal
          item={modalItem === "new" ? undefined : modalItem}
          categories={mockCategories}
          onClose={() => setModalItem(null)}
          onSave={saveItem}
        />
      )}

      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">จัดการเมนู</h1>
            <p style={{ color: "#636d83" }} className="text-sm mt-1">
              Menu Management
            </p>
          </div>
          <button
            onClick={() => setModalItem("new")}
            style={{ background: "#2a1a1a", color: "#e06c75" }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
          >
            + เพิ่มเมนูใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "เมนูทั้งหมด", value: stats.total, color: "#e06c75" },
            { label: "เปิดขาย", value: stats.available, color: "#98c379" },
            { label: "ปิดขาย", value: stats.unavailable, color: "#636d83" },
            { label: "เมนูแนะนำ ⭐", value: stats.featured, color: "#e5c07b" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
              className="rounded-xl p-4"
            >
              <div style={{ color: s.color }} className="text-2xl font-bold">
                {s.value}
              </div>
              <div style={{ color: "#636d83" }} className="text-xs mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={
                  selectedCat === cat
                    ? { background: "#2a1a1a", color: "#e06c75" }
                    : { color: "#636d83" }
                }
                className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเมนู..."
            style={{
              background: "#1a1d27",
              border: "1px solid #2d3141",
              color: "#fff",
            }}
            className="text-sm px-3 py-1.5 rounded-xl w-44 outline-none ml-auto"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onToggle={toggleAvailable}
              onEdit={(i) => setModalItem(i)}
            />
          ))}
          {filtered.length === 0 && (
            <div
              style={{ color: "#636d83" }}
              className="col-span-full text-center py-16 text-sm"
            >
              ไม่พบเมนู
            </div>
          )}
        </div>
      </div>
    </>
  );
}
