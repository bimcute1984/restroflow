"use client";

import { QueueEntry, Table } from "@/types";
import { useI18n } from "@/lib/i18n-context";

export default function AssignTableModal({ entry, tables, onAssign, onClose }: { entry: QueueEntry; tables: Table[]; onAssign: (tableId: string) => void; onClose: () => void }) {
  const { t } = useI18n();
  const available = tables.filter((t) => t.status === "available");

  const statusCfg = {
    available: { label: t.queue.tableStatus.available, colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border" },
    occupied: { label: t.queue.tableStatus.occupied, colorVar: "--red", bgVar: "--red-bg", borderVar: "--red-border" },
    reserved: { label: t.queue.tableStatus.reserved, colorVar: "--yellow", bgVar: "--yellow-bg", borderVar: "--yellow-border" },
    cleaning: { label: t.queue.tableStatus.cleaning, colorVar: "--cyan", bgVar: "--cyan-bg", borderVar: "--cyan-border" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-md overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between">
          <div>
            <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">🪑 {t.queue.selectTable}</h2>
            <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5">#{entry.queueNumber} · {entry.customerName} · {entry.partySize} {t.common.people}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="p-4 md:p-5">
          {available.length === 0 ? (
            <div style={{ border: "1.5px dashed var(--border)", color: "var(--text-dim)" }} className="rounded-2xl p-10 text-center text-sm">{t.queue.noTableAvailable}</div>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {tables.map((table) => {
                const cfg = statusCfg[table.status];
                const isAvailable = table.status === "available";
                const fits = table.capacity >= entry.partySize;
                return (
                  <button key={table.id} disabled={!isAvailable} onClick={() => isAvailable && onAssign(table.id)}
                    style={{ background: `var(${cfg.bgVar})`, border: `1.5px solid var(${isAvailable && fits ? "--green" : cfg.borderVar})`, opacity: isAvailable ? 1 : 0.35, cursor: isAvailable ? "pointer" : "not-allowed" }}
                    className="rounded-xl p-2.5 md:p-3 flex flex-col gap-1 transition-all hover:brightness-110 hover:translate-y-[-1px]">
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--text-primary)" }} className="font-bold text-xs md:text-sm">T{table.number}</span>
                      {isAvailable && fits && <span style={{ color: "var(--green)" }} className="text-xs">✓</span>}
                    </div>
                    <div style={{ color: "var(--text-muted)" }} className="text-[10px] md:text-xs">👥 {table.capacity} {t.common.seats}</div>
                    <div style={{ color: `var(${cfg.colorVar})` }} className="text-[10px] md:text-xs font-semibold">{cfg.label}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
