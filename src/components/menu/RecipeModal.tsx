"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n-context";
import { InventoryItem, MenuItemFull } from "@/types";
import {
  fetchRecipeForMenuItem, saveRecipe, fetchInventory,
  type RecipeItemRow,
} from "@/lib/supabase/queries";

interface RecipeEntry {
  inventoryItemId: string;
  quantity: number;
}

export default function RecipeModal({ menuItem, onClose }: {
  menuItem: MenuItemFull;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [entries, setEntries] = useState<RecipeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchInventory(), fetchRecipeForMenuItem(menuItem.id)])
      .then(([inv, recipe]) => {
        setInventory(inv);
        setEntries(recipe.map((r: RecipeItemRow) => ({
          inventoryItemId: r.inventoryItemId,
          quantity: r.quantity,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [menuItem.id]);

  function addEntry() {
    const unused = inventory.find((inv) => !entries.some((e) => e.inventoryItemId === inv.id));
    if (unused) {
      setEntries((prev) => [...prev, { inventoryItemId: unused.id, quantity: 0.1 }]);
    }
  }

  function removeEntry(idx: number) {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateEntry(idx: number, field: keyof RecipeEntry, value: string) {
    setEntries((prev) => prev.map((e, i) => {
      if (i !== idx) return e;
      if (field === "quantity") return { ...e, quantity: Math.max(0, Number(value) || 0) };
      return { ...e, [field]: value };
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveRecipe(menuItem.id, entries.filter((e) => e.quantity > 0));
      setSaved(true);
      setTimeout(() => onClose(), 800);
    } catch (e) {
      console.error("Failed to save recipe:", e);
    } finally {
      setSaving(false);
    }
  }

  const usedIds = entries.map((e) => e.inventoryItemId);
  const canAddMore = inventory.some((inv) => !usedIds.includes(inv.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md rounded-2xl flex flex-col animate-slide-up" style={{ maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 flex items-center justify-between shrink-0">
          <div>
            <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base">🧾 {t.menu.recipe.title}</h2>
            <p style={{ color: "var(--text-dim)" }} className="text-xs mt-0.5">{menuItem.name}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span style={{ color: "var(--text-dim)" }} className="text-sm">{t.common.loading}</span>
            </div>
          ) : saved ? (
            <div className="flex items-center justify-center py-8">
              <span style={{ color: "var(--green)" }} className="text-sm font-semibold">✅ {t.menu.recipe.saved}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.length === 0 && (
                <div className="text-center py-6">
                  <span style={{ color: "var(--text-dim)" }} className="text-sm">{t.menu.recipe.noRecipe}</span>
                </div>
              )}

              {entries.map((entry, idx) => {
                const inv = inventory.find((i) => i.id === entry.inventoryItemId);
                return (
                  <div key={idx} style={{ background: "var(--bg-deep)", border: "1px solid var(--border)" }} className="rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={entry.inventoryItemId}
                        onChange={(e) => updateEntry(idx, "inventoryItemId", e.target.value)}
                        className="input-styled flex-1 py-2 text-xs"
                      >
                        {inventory.filter((i) => i.id === entry.inventoryItemId || !usedIds.includes(i.id)).map((i) => (
                          <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeEntry(idx)}
                        style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }}
                        className="w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: "var(--text-muted)" }} className="text-xs shrink-0">{t.menu.recipe.amount}:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={entry.quantity}
                        onChange={(e) => updateEntry(idx, "quantity", e.target.value)}
                        className="input-styled flex-1 py-1.5 text-xs text-right"
                      />
                      <span style={{ color: "var(--text-dim)" }} className="text-xs shrink-0">{inv?.unit ?? ""}</span>
                    </div>
                  </div>
                );
              })}

              {canAddMore && (
                <button
                  onClick={addEntry}
                  style={{ border: "1.5px dashed var(--border)", color: "var(--blue)" }}
                  className="w-full py-3 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-hover)]"
                >
                  + {t.menu.recipe.addIngredient}
                </button>
              )}
            </div>
          )}
        </div>

        {!loading && !saved && (
          <div style={{ borderTop: "1px solid var(--border)" }} className="p-4 shrink-0">
            <button
              onClick={handleSave}
              disabled={saving}
              style={saving ? { background: "var(--border)", color: "var(--text-dim)" } : { background: "var(--blue-grad)", color: "#fff", boxShadow: "0 2px 12px var(--blue-border)" }}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            >
              {saving ? t.common.loading : t.common.save}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
