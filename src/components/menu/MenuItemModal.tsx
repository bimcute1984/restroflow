"use client";

import { useState } from "react";
import { MenuItemFull, MenuCategory } from "@/types";

const CATEGORY_EMOJIS: Record<string, string> = { "เครื่องดื่ม": "🥤", "ซุป": "🍲", "แกง": "🍛", "ยำ/สลัด": "🥗", "ของหวาน": "🍮", "เครื่องเคียง": "🍚" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{label}</label>{children}</div>;
}

function Toggle({ label, value, colorVar, bgVar, onChange }: { label: string; value: boolean; colorVar: string; bgVar: string; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      style={value ? { background: `var(${bgVar})`, border: `1px solid var(${colorVar})30`, color: `var(${colorVar})` } : { background: "var(--bg-deep)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
      className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
      <span>{label}</span>
      <span style={{ background: value ? `var(${colorVar})` : "var(--border)", color: value ? "var(--bg-deep)" : "var(--text-dim)" }} className="text-xs px-2 py-0.5 rounded-full">{value ? "เปิด" : "ปิด"}</span>
    </button>
  );
}

export default function MenuItemModal({ item, categories, onClose, onSave }: { item?: MenuItemFull; categories: MenuCategory[]; onClose: () => void; onSave: (item: MenuItemFull) => void }) {
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
    onSave({ id: item?.id ?? `menu-${Date.now()}`, name: name.trim(), price, category: selectedCat?.name ?? "", categoryId, description: description.trim() || undefined, available, featured });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-md flex flex-col overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between shrink-0">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">{isNew ? "📋 เพิ่มเมนูใหม่" : "✏️ แก้ไขเมนู"}</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-4 md:p-5 flex flex-col gap-4">
            <div style={{ background: "var(--bg-deep)", border: "1.5px dashed var(--border)" }} className="rounded-2xl h-24 md:h-28 flex items-center justify-center">
              <span className="text-4xl md:text-5xl">{CATEGORY_EMOJIS[selectedCat?.name ?? ""] ?? "🍽️"}</span>
            </div>
            <Field label="ชื่อเมนู *"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="เช่น ข้าวผัดกุ้ง" autoFocus className="input-styled w-full py-2.5" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ราคา (฿) *"><input type="number" value={price} min={1} onChange={(e) => setPrice(Number(e.target.value))} className="input-styled w-full py-2.5" /></Field>
              <Field label="หมวดหมู่ *"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-styled w-full py-2.5">{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></Field>
            </div>
            <Field label="คำอธิบาย (ไม่บังคับ)"><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="อธิบายเมนูสั้นๆ" rows={2} className="input-styled w-full" style={{ resize: "none" }} /></Field>
            <div className="flex flex-col gap-2">
              <Toggle label="เปิดขาย" value={available} colorVar="--green" bgVar="--green-bg" onChange={setAvailable} />
              <Toggle label="เมนูแนะนำ ⭐" value={featured} colorVar="--yellow" bgVar="--yellow-bg" onChange={setFeatured} />
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)" }} className="p-4 md:p-5 flex gap-3 shrink-0">
          <button onClick={onClose} style={{ background: "var(--border)", color: "var(--text-muted)" }} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-125">ยกเลิก</button>
          <button onClick={handleSave} disabled={!name.trim() || price <= 0}
            style={name.trim() && price > 0 ? { background: "var(--red-grad)", color: "#fff", boxShadow: "0 2px 12px var(--red-border)" } : { background: "var(--border)", color: "var(--text-dim)" }}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all">{isNew ? "เพิ่มเมนู" : "บันทึก"}</button>
        </div>
      </div>
    </div>
  );
}
