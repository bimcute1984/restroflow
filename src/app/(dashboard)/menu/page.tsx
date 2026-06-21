"use client";

import { useState, useEffect } from "react";
import { MenuItemFull, MenuCategory } from "@/types";
import { fetchMenuItemsFull, fetchCategories, upsertMenuItem, toggleMenuAvailability } from "@/lib/supabase/queries";
import MenuItemModal from "@/components/menu/MenuItemModal";
import RecipeModal from "@/components/menu/RecipeModal";
import { useI18n } from "@/lib/i18n-context";
import { localizedName, localizedDesc } from "@/lib/menu-i18n";
import type { Locale } from "@/lib/i18n/translations";

const categoryEmoji: Record<string, string> = { "เครื่องดื่ม": "🥤", "ซุป": "🍲", "แกง": "🍛", "ยำ/สลัด": "🥗", "ของหวาน": "🍮", "เครื่องเคียง": "🍚", "อาหารจานหลัก": "🍽️" };

function MenuItemCard({ item, locale, onToggle, onEdit, onRecipe, labels }: { item: MenuItemFull; locale: Locale; onToggle: (id: string) => void; onEdit: (item: MenuItemFull) => void; onRecipe: (item: MenuItemFull) => void; labels: { on: string; off: string; edit: string; recipe: string } }) {
  const emoji = categoryEmoji[item.category] || "🍽️";
  const displayName = localizedName(item, locale);
  const displayDesc = localizedDesc(item, locale);
  return (
    <div style={{ background: "var(--bg-card)", border: `1.5px solid ${item.available ? "var(--border)" : "var(--red-border)"}`, opacity: item.available ? 1 : 0.6, boxShadow: "var(--card-shadow)" }} className="rounded-2xl p-3 md:p-4 flex flex-col gap-2 md:gap-3 transition-all hover:translate-y-[-2px]">
      <div style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl h-20 md:h-28 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl md:text-4xl">{emoji}</span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-1 md:gap-2">
          <span style={{ color: "var(--text-primary)" }} className="font-semibold text-xs md:text-sm">{displayName}</span>
          {item.featured && <span style={{ background: "var(--yellow-bg)", color: "var(--yellow)", border: "1px solid var(--yellow-border)" }} className="text-[10px] px-1.5 md:px-2 py-0.5 rounded-full shrink-0">⭐</span>}
        </div>
        {displayDesc && <p style={{ color: "var(--text-dim)" }} className="text-[10px] md:text-xs mt-1 line-clamp-2">{displayDesc}</p>}
      </div>
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--blue)" }} className="font-bold text-sm md:text-base">฿{item.price}</span>
        <div className="flex items-center gap-1 md:gap-2">
          <button onClick={() => onRecipe(item)} style={{ background: "var(--yellow-bg)", color: "var(--yellow)", border: "1px solid var(--yellow-border)" }} className="text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg transition-all" title={labels.recipe}>🧾</button>
          <button onClick={() => onToggle(item.id)} style={item.available ? { background: "var(--green-bg)", color: "var(--green)", border: "1px solid var(--green-border)" } : { background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }} className="text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg transition-all">{item.available ? labels.on : labels.off}</button>
          <button onClick={() => onEdit(item)} style={{ background: "var(--border)", color: "var(--text-secondary)" }} className="text-[10px] md:text-xs px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg font-semibold transition-all hover:brightness-125">{labels.edit}</button>
        </div>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { t, locale } = useI18n();
  const [items, setItems] = useState<MenuItemFull[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string>(t.common.all);
  const [search, setSearch] = useState("");
  const [modalItem, setModalItem] = useState<MenuItemFull | null | "new">(null);
  const [recipeItem, setRecipeItem] = useState<MenuItemFull | null>(null);

  useEffect(() => {
    Promise.all([fetchMenuItemsFull(), fetchCategories()])
      .then(([menuData, catData]) => { setItems(menuData); setCategories(catData); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newAvail = !item.available;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, available: newAvail } : i));
    try {
      await toggleMenuAvailability(id, newAvail);
    } catch (e) {
      console.error("Failed to toggle:", e);
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, available: !newAvail } : i));
    }
  }

  async function saveItem(updated: MenuItemFull) {
    try {
      await upsertMenuItem(updated);
      const fresh = await fetchMenuItemsFull();
      setItems(fresh);
    } catch (e) {
      console.error("Failed to save:", e);
    }
    setModalItem(null);
  }

  const catNames = [t.common.all, ...categories.map((c) => c.name)];
  const filtered = items.filter((item) => {
    if (selectedCat !== t.common.all && item.category !== selectedCat) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    return localizedName(item, locale).toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
  });
  const stats = { total: items.length, available: items.filter((i) => i.available).length, featured: items.filter((i) => i.featured).length, unavailable: items.filter((i) => !i.available).length };

  if (loading) {
    return <div className="flex items-center justify-center h-full page-bg"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.common.loading}</span></div>;
  }

  return (
    <>
      {modalItem !== null && <MenuItemModal item={modalItem === "new" ? undefined : modalItem} categories={categories} onClose={() => setModalItem(null)} onSave={saveItem} />}
      {recipeItem && <RecipeModal menuItem={recipeItem} onClose={() => setRecipeItem(null)} />}

      <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">{t.menu.title}</h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">{t.menu.subtitle}</p>
          </div>
          <button onClick={() => setModalItem("new")} style={{ background: "var(--red-grad)", color: "#fff", boxShadow: "0 2px 12px var(--red-border)" }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]">
            + <span className="hidden sm:inline">{t.menu.addNew}</span><span className="sm:hidden">{t.menu.addMenu}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {[
            { label: t.menu.totalMenus, value: stats.total, v: "--red", icon: "📋" },
            { label: t.menu.available, value: stats.available, v: "--green", icon: "✅" },
            { label: t.menu.unavailable, value: stats.unavailable, v: "--text-muted", icon: "🚫" },
            { label: t.menu.featured, value: stats.featured, v: "--yellow", icon: "⭐" },
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
            {catNames.map((cat) => (
              <button key={cat} onClick={() => setSelectedCat(cat)}
                style={selectedCat === cat ? { background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" } : { color: "var(--text-muted)", border: "1px solid transparent" }}
                className="text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg transition-all">{cat}</button>
            ))}
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.menu.searchMenu} className="input-styled text-xs md:text-sm py-1.5 w-36 md:w-44 ml-auto" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 animate-fade-in">
          {filtered.map((item) => <MenuItemCard key={item.id} item={item} locale={locale} onToggle={handleToggle} onEdit={(i) => setModalItem(i)} onRecipe={(i) => setRecipeItem(i)} labels={{ on: t.common.on, off: t.common.off, edit: t.common.edit, recipe: t.menu.recipe.title }} />)}
          {filtered.length === 0 && <div style={{ color: "var(--text-dim)" }} className="col-span-full text-center py-16 text-sm">{t.menu.noMenu}</div>}
        </div>
      </div>
    </>
  );
}
