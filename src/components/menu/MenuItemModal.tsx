"use client";

import { useState, useRef } from "react";
import { MenuItemFull, MenuCategory, MenuItemTranslations } from "@/types";
import { useI18n } from "@/lib/i18n-context";
import { LOCALE_FLAGS, type Locale } from "@/lib/i18n/translations";

const CATEGORY_EMOJIS: Record<string, string> = { "เครื่องดื่ม": "🥤", "ซุป": "🍲", "แกง": "🍛", "ยำ/สลัด": "🥗", "ของหวาน": "🍮", "เครื่องเคียง": "🍚" };

const TRANS_LANGS: { key: "en" | "ja" | "ko"; label: string; flag: string }[] = [
  { key: "en", label: "English", flag: LOCALE_FLAGS.en },
  { key: "ja", label: "日本語", flag: LOCALE_FLAGS.ja },
  { key: "ko", label: "한국어", flag: LOCALE_FLAGS.ko },
];

export default function MenuItemModal({ item, categories, onClose, onSave }: { item?: MenuItemFull; categories: MenuCategory[]; onClose: () => void; onSave: (item: MenuItemFull) => void }) {
  const { t } = useI18n();
  const isNew = !item;
  const defaultCat = categories[0];
  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? defaultCat?.id ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [imageUrl, setImageUrl] = useState(item?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(item?.image ?? "");
  const [showTrans, setShowTrans] = useState(false);
  const [translations, setTranslations] = useState<MenuItemTranslations>(item?.translations ?? {});
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedCat = categories.find((c) => c.id === categoryId);

  function setTransField(lang: "en" | "ja" | "ko", field: "name" | "description", value: string) {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev?.[lang], [field]: value || undefined },
    }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (json.url) setImageUrl(json.url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  function handleSave() {
    if (!name.trim() || price <= 0 || !categoryId) return;
    const cleanTrans: MenuItemTranslations = {};
    for (const lang of TRANS_LANGS) {
      const entry = translations?.[lang.key];
      if (entry?.name || entry?.description) {
        cleanTrans[lang.key] = {
          name: entry.name || undefined,
          description: entry.description || undefined,
        };
      }
    }
    onSave({
      id: item?.id ?? `menu-${Date.now()}`,
      name: name.trim(),
      price,
      image: imageUrl || undefined,
      category: selectedCat?.name ?? "",
      categoryId,
      description: description.trim() || undefined,
      available,
      featured,
      translations: Object.keys(cleanTrans).length > 0 ? cleanTrans : undefined,
    });
  }

  function Toggle({ label, value, colorVar, bgVar, onChange }: { label: string; value: boolean; colorVar: string; bgVar: string; onChange: (v: boolean) => void }) {
    return (
      <button onClick={() => onChange(!value)}
        style={value ? { background: `var(${bgVar})`, border: `1px solid var(${colorVar})30`, color: `var(${colorVar})` } : { background: "var(--bg-deep)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
        className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
        <span>{label}</span>
        <span style={{ background: value ? `var(${colorVar})` : "var(--border)", color: value ? "var(--bg-deep)" : "var(--text-dim)" }} className="text-xs px-2 py-0.5 rounded-full">{value ? t.common.on : t.common.off}</span>
      </button>
    );
  }

  const hasTranslations = TRANS_LANGS.some((l) => translations?.[l.key]?.name || translations?.[l.key]?.description);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-md flex flex-col overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between shrink-0">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">{isNew ? `📋 ${t.menu.modal.addTitle}` : `✏️ ${t.menu.modal.editTitle}`}</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-4 md:p-5 flex flex-col gap-4">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ background: "var(--bg-deep)", border: "1.5px dashed var(--border)" }}
              className="rounded-2xl h-32 md:h-36 flex items-center justify-center overflow-hidden relative cursor-pointer transition-all hover:brightness-110"
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                      <span className="text-white text-xs font-semibold">{t.common.loading}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{CATEGORY_EMOJIS[selectedCat?.name ?? ""] ?? "🍽️"}</span>
                  <span style={{ color: "var(--text-dim)" }} className="text-xs">{t.menu.modal.uploadImage}</span>
                </div>
              )}
            </button>

            {/* Thai name & description (primary) */}
            <div className="flex flex-col gap-1.5">
              <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{LOCALE_FLAGS.th} {t.menu.modal.menuName}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.menu.modal.menuNamePlaceholder} autoFocus className="input-styled w-full py-2.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.menu.modal.price}</label><input type="number" value={price} min={1} onChange={(e) => setPrice(Number(e.target.value))} className="input-styled w-full py-2.5" /></div>
              <div className="flex flex-col gap-1.5"><label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{t.menu.modal.category}</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-styled w-full py-2.5">{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">{LOCALE_FLAGS.th} {t.menu.modal.description}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.menu.modal.descriptionPlaceholder} rows={2} className="input-styled w-full" style={{ resize: "none" }} />
            </div>

            {/* Translations toggle */}
            <button
              onClick={() => setShowTrans(!showTrans)}
              style={{ background: "var(--bg-deep)", border: `1.5px solid ${hasTranslations ? "var(--blue-border)" : "var(--border)"}`, color: hasTranslations ? "var(--blue)" : "var(--text-muted)" }}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <span>🌐 {t.menu.modal.translations}</span>
              <span className="text-xs">{showTrans ? "▲" : "▼"} {hasTranslations && `(${TRANS_LANGS.filter((l) => translations?.[l.key]?.name).length})`}</span>
            </button>

            {/* Translation fields */}
            {showTrans && (
              <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl p-3 flex flex-col gap-3">
                {TRANS_LANGS.map((lang) => (
                  <div key={lang.key} className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{lang.flag}</span>
                      <span style={{ color: "var(--text-primary)" }} className="text-xs font-bold">{lang.label}</span>
                    </div>
                    <input
                      value={translations?.[lang.key]?.name ?? ""}
                      onChange={(e) => setTransField(lang.key, "name", e.target.value)}
                      placeholder={t.menu.modal.transPlaceholder.replace("{lang}", lang.label)}
                      className="input-styled w-full py-2 text-xs"
                    />
                    <input
                      value={translations?.[lang.key]?.description ?? ""}
                      onChange={(e) => setTransField(lang.key, "description", e.target.value)}
                      placeholder={t.menu.modal.transDescPlaceholder.replace("{lang}", lang.label)}
                      className="input-styled w-full py-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Toggle label={t.menu.modal.selling} value={available} colorVar="--green" bgVar="--green-bg" onChange={setAvailable} />
              <Toggle label={`${t.menu.modal.recommended} ⭐`} value={featured} colorVar="--yellow" bgVar="--yellow-bg" onChange={setFeatured} />
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)" }} className="p-4 md:p-5 flex gap-3 shrink-0">
          <button onClick={onClose} style={{ background: "var(--border)", color: "var(--text-muted)" }} className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-125">{t.common.cancel}</button>
          <button onClick={handleSave} disabled={!name.trim() || price <= 0 || uploading}
            style={name.trim() && price > 0 && !uploading ? { background: "var(--red-grad)", color: "#fff", boxShadow: "0 2px 12px var(--red-border)" } : { background: "var(--border)", color: "var(--text-dim)" }}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all">{isNew ? t.menu.modal.addBtn : t.common.save}</button>
        </div>
      </div>
    </div>
  );
}
