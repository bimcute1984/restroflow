"use client";

import { useState } from "react";
import { Table } from "@/types";
import { useI18n } from "@/lib/i18n-context";

function isRoom(table: Table) { return table.number >= 100; }
function displayLabel(table: Table) { return isRoom(table) ? `R${table.number - 100}` : `T${table.number}`; }

export default function ReserveTableModal({
  table,
  onConfirm,
  onClose,
}: {
  table: Table;
  onConfirm: (reservedBy: string, reservedTime: Date) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");

  const now = new Date();
  const defaultTime = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultStr = `${defaultTime.getFullYear()}-${String(defaultTime.getMonth() + 1).padStart(2, "0")}-${String(defaultTime.getDate()).padStart(2, "0")}T${String(defaultTime.getHours()).padStart(2, "0")}:${String(defaultTime.getMinutes()).padStart(2, "0")}`;
  const [timeStr, setTimeStr] = useState(defaultStr);

  const minTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const canSubmit = name.trim().length > 0 && timeStr.length > 0 && new Date(timeStr) > now;

  function handleSubmit() {
    if (!canSubmit) return;
    onConfirm(name.trim(), new Date(timeStr));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-md overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between">
          <div>
            <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">📋 {t.queue.reservation.title}</h2>
            <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5">
              {isRoom(table) && "🏛️ "}{displayLabel(table)} · 👥 {table.capacity} {t.common.seats}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="p-4 md:p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-secondary)" }} className="text-xs font-semibold">{t.queue.reservation.reservedBy}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.queue.reservation.reservedByPlaceholder}
              style={{ background: "var(--bg-input)", color: "var(--text-primary)", border: "1.5px solid var(--border)" }}
              className="px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[var(--blue)] transition-colors"
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-secondary)" }} className="text-xs font-semibold">{t.queue.reservation.reservedTime}</label>
            <input
              type="datetime-local"
              value={timeStr}
              min={minTime}
              onChange={(e) => setTimeStr(e.target.value)}
              style={{ background: "var(--bg-input)", color: "var(--text-primary)", border: "1.5px solid var(--border)" }}
              className="px-3 py-2.5 rounded-xl text-sm outline-none focus:border-[var(--blue)] transition-colors"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? "var(--yellow-grad)" : "var(--bg-hover)",
              color: canSubmit ? "#1a1a0e" : "var(--text-dim)",
              boxShadow: canSubmit ? "0 2px 12px var(--yellow-border)" : "none",
            }}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {t.queue.reservation.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
