"use client";

import { QueueEntry, Table } from "@/types";
import { useI18n } from "@/lib/i18n-context";

function isRoom(table: Table) { return table.number >= 100; }
function displayLabel(table: Table) { return isRoom(table) ? `R${table.number - 100}` : `T${table.number}`; }

export default function AssignTableModal({ entry, tables, onAssign, onClose }: { entry: QueueEntry; tables: Table[]; onAssign: (tableId: string) => void; onClose: () => void }) {
  const { t } = useI18n();

  const statusCfg = {
    available: { label: t.queue.tableStatus.available, colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border" },
    occupied: { label: t.queue.tableStatus.occupied, colorVar: "--red", bgVar: "--red-bg", borderVar: "--red-border" },
    reserved: { label: t.queue.tableStatus.reserved, colorVar: "--yellow", bgVar: "--yellow-bg", borderVar: "--yellow-border" },
    cleaning: { label: t.queue.tableStatus.cleaning, colorVar: "--cyan", bgVar: "--cyan-bg", borderVar: "--cyan-border" },
  };

  const sorted = [...tables].sort((a, b) => {
    const aFit = a.status === "available" && a.capacity >= entry.partySize ? 0 : 1;
    const bFit = b.status === "available" && b.capacity >= entry.partySize ? 0 : 1;
    if (aFit !== bFit) return aFit - bFit;
    return a.number - b.number;
  });

  const hasFitting = sorted.some((t) => t.status === "available" && t.capacity >= entry.partySize);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-md overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between">
          <div>
            <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">🪑 {t.queue.selectTable}</h2>
            <p style={{ color: "var(--text-muted)" }} className="text-xs mt-0.5">#{entry.queueNumber} · {entry.customerName} · 👥 {entry.partySize} {t.common.people}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="p-4 md:p-5">
          {!hasFitting ? (
            <div style={{ border: "1.5px dashed var(--red-border)", color: "var(--red)", background: "var(--red-bg)" }} className="rounded-2xl p-6 text-center text-sm font-semibold">
              {t.queue.noTableFit}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {sorted.map((table) => {
                const cfg = statusCfg[table.status];
                const isAvailable = table.status === "available";
                const fits = table.capacity >= entry.partySize;
                const canSelect = isAvailable && fits;
                return (
                  <button key={table.id} disabled={!canSelect} onClick={() => canSelect && onAssign(table.id)}
                    style={{
                      background: `var(${cfg.bgVar})`,
                      border: `1.5px solid var(${canSelect ? "--green-border" : cfg.borderVar})`,
                      opacity: canSelect ? 1 : 0.35,
                      cursor: canSelect ? "pointer" : "not-allowed",
                    }}
                    className="rounded-xl p-2.5 md:p-3 flex flex-col gap-1 transition-all hover:brightness-110 hover:translate-y-[-1px]">
                    <div className="flex items-center justify-between">
                      <span style={{ color: "var(--text-primary)" }} className="font-bold text-xs md:text-sm">{isRoom(table) && "🏛️"}{displayLabel(table)}</span>
                      {canSelect && <span style={{ color: "var(--green)" }} className="text-xs">✓</span>}
                      {isAvailable && !fits && <span style={{ color: "var(--red)" }} className="text-[10px]">✕</span>}
                    </div>
                    <div style={{ color: isAvailable && !fits ? "var(--red)" : "var(--text-muted)" }} className="text-[10px] md:text-xs font-semibold">
                      👥 {table.capacity} {t.common.seats}
                    </div>
                    <div style={{ color: `var(${cfg.colorVar})` }} className="text-[10px] md:text-xs font-semibold">
                      {isAvailable && !fits ? t.queue.tooSmall : cfg.label}
                    </div>
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
