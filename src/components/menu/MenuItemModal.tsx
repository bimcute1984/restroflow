"use client";

import { useState } from "react";
import { MenuItemFull, MenuCategory } from "@/types";

const CATEGORY_EMOJIS: Record<string, string> = {
  "เครื่องดื่ม": "🥤",
  "ซุป": "🍲",
  "แกง": "🍛",
  "ยำ/สลัด": "🥗",
  "ของหวาน": "🍮",
};

function categoryEmoji(cat: string) {
  return CATEGORY_EMOJIS[cat] ?? "🍽️";
}

export default function MenuItemModal({
  item,
  categories,
  onClose,
  onSave,
}: {
  item?: MenuItemFull;
  categories: MenuCategory[];
  onClose: () => void;
  onSave: (item: MenuItemFull) => void;
}) {
  const isNew = !item;
  const defaultCat = categories[0];

  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? defaultCat?.id ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [featured, setFeatured] = useState(item?.featured ?? false);

  const selectedCat = categories.find((c) => c.id === categoryId);

  function handleSave() {
    if (!name.trim() || price <= 0 || !categoryId) return;
    const result: MenuItemFull = {
      id: item?.id ?? `menu-${Date.now()}`,
      name: name.trim(),
      price,
      category: selectedCat?.name ?? "",
      categoryId,
      description: description.trim() || undefined,
      available,
      featured,
    };
    onSave(result);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "#0008" }}
    >
      <div
        style={{ background: "#1a1d27", border: "1px solid #2d3141", maxHeight: "90vh" }}
        className="w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ borderBottom: "1px solid #2d3141" }}
          className="p-5 flex items-center justify-between shrink-0"
        >
          <h2 className="text-white font-bold text-lg">
            {isNew ? "เพิ่มเมนูใหม่" : "แก้ไขเมนู"}
          </h2>
          <button onClick={onClose} style={{ color: "#636d83" }} className="text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-5 flex flex-col gap-4">
            {/* Image placeholder */}
            <div
              style={{ background: "#0f1117", border: "1.5px dashed #2d3141" }}
              className="rounded-2xl h-28 flex items-center justify-center"
            >
              <span className="text-5xl">{categoryEmoji(selectedCat?.name ?? "")}</span>
            </div>

            <Field label="ชื่อเมนู *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ข้าวผัดกุ้ง"
                autoFocus
                style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="ราคา (฿) *">
                <input
                  type="number"
                  value={price}
                  min={1}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                />
              </Field>

              <Field label="หมวดหมู่ *">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff" }}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="คำอธิบาย (ไม่บังคับ)">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="อธิบายเมนูสั้นๆ"
                rows={2}
                style={{ background: "#0f1117", border: "1px solid #2d3141", color: "#fff", resize: "none" }}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              />
            </Field>

            {/* Toggles */}
            <div className="flex flex-col gap-2">
              <Toggle
                label="เปิดขาย"
                value={available}
                onColor="#98c379"
                onBg="#1e2a1e"
                onChange={setAvailable}
              />
              <Toggle
                label="เมนูแนะนำ ⭐"
                value={featured}
                onColor="#e5c07b"
                onBg="#2a2010"
                onChange={setFeatured}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{ borderTop: "1px solid #2d3141" }}
          className="p-5 flex gap-3 shrink-0"
        >
          <button
            onClick={onClose}
            style={{ background: "#2d3141", color: "#636d83" }}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || price <= 0}
            style={
              name.trim() && price > 0
                ? { background: "#2a1a1a", color: "#e06c75" }
                : { background: "#2d3141", color: "#636d83" }
            }
            className="flex-1 py-2.5 rounded-xl font-bold text-sm"
          >
            {isNew ? "เพิ่มเมนู" : "บันทึก"}
          </button>
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

function Toggle({
  label,
  value,
  onColor,
  onBg,
  onChange,
}: {
  label: string;
  value: boolean;
  onColor: string;
  onBg: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={
        value
          ? { background: onBg, border: `1px solid ${onColor}44`, color: onColor }
          : { background: "#0f1117", border: "1px solid #2d3141", color: "#636d83" }
      }
      className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold"
    >
      <span>{label}</span>
      <span
        style={{
          background: value ? onColor : "#2d3141",
          color: value ? "#0f1117" : "#636d83",
        }}
        className="text-xs px-2 py-0.5 rounded-full"
      >
        {value ? "เปิด" : "ปิด"}
      </span>
    </button>
  );
}
