"use client";

import { useState, useEffect, use } from "react";
import { MenuItem } from "@/types";
import { fetchMenuItems, fetchCategories, createOrder } from "@/lib/supabase/queries";
import { useI18n } from "@/lib/i18n-context";
import { useTheme } from "@/lib/theme-context";
import { LOCALE_FLAGS, type Locale } from "@/lib/i18n/translations";
import { localizedName, localizedDesc } from "@/lib/menu-i18n";
import type { MenuCategory } from "@/types";

interface CartItem {
  item: MenuItem;
  qty: number;
  note?: string;
}

const categoryEmoji: Record<string, string> = {
  "อาหารจานหลัก": "🍽️", "ซุป": "🍲", "ยำ/สลัด": "🥗", "แกง": "🍛",
  "เครื่องดื่ม": "🥤", "เครื่องเคียง": "🍚", "ของหวาน": "🍮",
};

type PageState = "menu" | "cart" | "success" | "error";

export default function ScanOrderPage({ params }: { params: Promise<{ table: string }> }) {
  const { table: tableNum } = use(params);
  const { t, locale: currentLocale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [pageState, setPageState] = useState<PageState>("menu");
  const [sending, setSending] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [noteItemId, setNoteItemId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    Promise.all([fetchMenuItems(), fetchCategories()])
      .then(([items, cats]) => {
        setMenuItems(items.filter((i) => i.available));
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = selectedCat === "all"
    ? menuItems
    : menuItems.filter((m) => m.category === selectedCat);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) return prev.map((c) => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { item, qty: 1 }];
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.flatMap((c) => {
      if (c.item.id !== id) return [c];
      return c.qty > 1 ? [{ ...c, qty: c.qty - 1 }] : [];
    }));
  }

  function saveNote(id: string) {
    setCart((prev) => prev.map((c) => c.item.id === id ? { ...c, note: noteText || undefined } : c));
    setNoteItemId(null);
    setNoteText("");
  }

  const total = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  async function handlePlaceOrder() {
    setSending(true);
    try {
      const id = await createOrder({
        type: "dine-in",
        tableNumber: Number(tableNum),
        items: cart.map((c) => ({
          menuItemId: c.item.id,
          quantity: c.qty,
          unitPrice: c.item.price,
          note: c.note,
        })),
        total,
      });
      setOrderId(id);
      setPageState("success");
      setCart([]);
    } catch (e) {
      console.error("Order failed:", e);
      setPageState("error");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center page-bg">
        <div className="text-center animate-fade-in">
          <div className="text-5xl mb-3">🍽️</div>
          <p style={{ color: "var(--text-muted)" }} className="text-sm">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (pageState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 page-bg">
        <div className="w-full max-w-sm text-center animate-fade-in">
          <div className="text-6xl mb-4">✅</div>
          <h1 style={{ color: "var(--text-primary)" }} className="text-2xl font-bold mb-2">{t.scan.success}</h1>
          <p style={{ color: "var(--text-muted)" }} className="text-sm mb-6">{t.scan.successMsg}</p>
          <div className="card-glass p-4 mb-6">
            <div style={{ color: "var(--text-dim)" }} className="text-xs mb-1">{t.scan.orderNumber}</div>
            <div style={{ color: "var(--blue)" }} className="font-mono font-bold text-lg">{orderId.substring(0, 12)}</div>
          </div>
          <button
            onClick={() => { setPageState("menu"); setOrderId(""); }}
            style={{ background: "var(--blue-grad)", color: "#fff" }}
            className="w-full py-3 rounded-xl font-bold text-sm"
          >
            {t.scan.orderAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <span style={{ color: "var(--text-primary)" }} className="font-bold text-lg">
            restro<span style={{ color: "var(--blue)" }}>flow</span>
          </span>
          <div style={{ color: "var(--text-muted)" }} className="text-xs">
            🪑 {t.scan.tableLabel.replace("{n}", tableNum)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["th", "en", "ja", "ko"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                style={currentLocale === l ? { background: "var(--blue-bg)", border: "1px solid var(--blue-border)" } : { background: "var(--bg-card)", border: "1px solid var(--border)" }}
                className="w-7 h-7 rounded-lg text-xs transition-all flex items-center justify-center"
              >
                {LOCALE_FLAGS[l]}
              </button>
            ))}
          </div>
          <button onClick={toggle} className="text-lg" style={{ color: "var(--text-muted)" }}>
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* Category tabs */}
      <div
        className="sticky top-[57px] z-20 px-3 py-2 flex gap-2 overflow-x-auto"
        style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={() => setSelectedCat("all")}
          style={selectedCat === "all"
            ? { background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid var(--blue-border)" }
            : { color: "var(--text-muted)", border: "1px solid var(--border)" }}
          className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all"
        >
          {t.common.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.name)}
            style={selectedCat === cat.name
              ? { background: "var(--blue-bg)", color: "var(--blue)", border: "1px solid var(--blue-border)" }
              : { color: "var(--text-muted)", border: "1px solid var(--border)" }}
            className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-all"
          >
            {categoryEmoji[cat.name] || "🍽️"} {cat.name}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      <div className="flex-1 p-3 grid grid-cols-2 gap-2.5 content-start" style={{ paddingBottom: totalItems > 0 ? "80px" : "16px" }}>
        {filtered.map((item) => {
          const inCart = cart.find((c) => c.item.id === item.id);
          return (
            <div
              key={item.id}
              style={{
                background: "var(--bg-card)",
                border: inCart ? "1.5px solid var(--blue-border)" : "1.5px solid var(--border)",
                boxShadow: "var(--card-shadow)",
              }}
              className="rounded-xl p-3 flex flex-col gap-2 transition-all"
            >
              <div
                style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }}
                className="rounded-lg h-24 flex items-center justify-center overflow-hidden"
              >
                {item.image ? (
                  <img src={item.image} alt={localizedName(item, currentLocale)} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{categoryEmoji[item.category] || "🍽️"}</span>
                )}
              </div>
              <div>
                <div style={{ color: "var(--text-primary)" }} className="text-xs font-semibold line-clamp-1">{localizedName(item, currentLocale)}</div>
                {localizedDesc(item, currentLocale) && (
                  <div style={{ color: "var(--text-dim)" }} className="text-[10px] line-clamp-1 mt-0.5">{localizedDesc(item, currentLocale)}</div>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto">
                <span style={{ color: "var(--blue)" }} className="font-bold text-sm">฿{item.price}</span>
                {inCart ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: "var(--border)", color: "var(--text-secondary)" }}
                      className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center"
                    >−</button>
                    <span style={{ color: "var(--text-primary)" }} className="text-xs font-bold w-5 text-center">{inCart.qty}</span>
                    <button
                      onClick={() => addToCart(item)}
                      style={{ background: "var(--blue-bg)", color: "var(--blue)" }}
                      className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center"
                    >+</button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    style={{ background: "var(--blue-grad)", color: "#fff" }}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all active:scale-95"
                  >
                    + {t.scan.addItem}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note modal */}
      {noteItemId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center modal-overlay" onClick={() => setNoteItemId(null)}>
          <div className="modal-content w-full max-w-sm rounded-t-2xl p-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: "var(--text-primary)" }} className="font-bold text-sm mb-3">{t.scan.note}</h3>
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t.scan.notePlaceholder}
              className="input-styled w-full py-2.5 mb-3"
              autoFocus
            />
            <button onClick={() => saveNote(noteItemId)} style={{ background: "var(--blue-grad)", color: "#fff" }} className="w-full py-2.5 rounded-xl font-bold text-sm">
              {t.common.save}
            </button>
          </div>
        </div>
      )}

      {/* Cart bar + sheet */}
      {totalItems > 0 && pageState === "menu" && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          {pageState === "menu" && (
            <button
              onClick={() => setPageState("cart")}
              style={{ background: "var(--blue-grad)", color: "#fff", boxShadow: "0 -4px 20px rgba(0,0,0,0.2)" }}
              className="w-full py-4 px-6 flex items-center justify-between font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                🛒 {t.scan.yourOrder}
                <span style={{ background: "rgba(255,255,255,0.2)" }} className="text-xs px-2 py-0.5 rounded-full">{totalItems}</span>
              </span>
              <span>฿{total.toLocaleString()}</span>
            </button>
          )}
        </div>
      )}

      {/* Cart sheet */}
      {pageState === "cart" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center modal-overlay" onClick={() => setPageState("menu")}>
          <div
            className="modal-content w-full max-w-md rounded-t-2xl flex flex-col animate-slide-up"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 flex items-center justify-between shrink-0">
              <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base">🛒 {t.scan.yourOrder}</h2>
              <button onClick={() => setPageState("menu")} style={{ color: "var(--text-dim)" }} className="text-xl font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {cart.map(({ item, qty, note }) => (
                <div key={item.id} style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: "var(--text-primary)" }} className="text-sm font-medium">{localizedName(item, currentLocale)}</span>
                    <span style={{ color: "var(--blue)" }} className="text-sm font-bold">฿{(item.price * qty).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => removeFromCart(item.id)} style={{ background: "var(--border)", color: "var(--text-secondary)" }} className="w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center">−</button>
                      <span style={{ color: "var(--text-primary)" }} className="text-sm font-bold w-6 text-center">{qty}</span>
                      <button onClick={() => addToCart(item)} style={{ background: "var(--blue-bg)", color: "var(--blue)" }} className="w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center">+</button>
                    </div>
                    <button
                      onClick={() => { setNoteItemId(item.id); setNoteText(note || ""); }}
                      style={{ color: note ? "var(--blue)" : "var(--text-dim)" }}
                      className="text-xs"
                    >
                      {note ? `📝 ${note}` : `📝 ${t.scan.note}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border)" }} className="p-4 flex flex-col gap-3 shrink-0">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }} className="font-semibold">{t.scan.subtotal}</span>
                <span style={{ color: "var(--text-primary)" }} className="font-bold text-lg">฿{total.toLocaleString()}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={sending}
                style={sending
                  ? { background: "var(--border)", color: "var(--text-dim)" }
                  : { background: "var(--green-grad)", color: "#fff", boxShadow: "0 2px 12px var(--green-border)" }}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              >
                {sending ? t.scan.sending : `${t.scan.placeOrder} ฿${total.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
