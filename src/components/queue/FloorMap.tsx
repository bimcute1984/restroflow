"use client";

import { useState } from "react";
import { Table } from "@/types";
import { useI18n } from "@/lib/i18n-context";

type StatusAction = Table["status"];

function isRoom(table: Table) {
  return table.number >= 100;
}

function displayLabel(table: Table) {
  return isRoom(table) ? `R${table.number - 100}` : `T${table.number}`;
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function FloorMap({ tables, onStatusChange, onReserve }: { tables: Table[]; onStatusChange?: (tableId: string, status: Table["status"]) => void; onReserve?: (table: Table) => void }) {
  const { t } = useI18n();
  const [activeTable, setActiveTable] = useState<string | null>(null);

  const tableStatusConfig = {
    available: { label: t.queue.tableStatus.available, colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border", icon: "✓" },
    occupied: { label: t.queue.tableStatus.occupied, colorVar: "--red", bgVar: "--red-bg", borderVar: "--red-border", icon: "●" },
    reserved: { label: t.queue.tableStatus.reserved, colorVar: "--yellow", bgVar: "--yellow-bg", borderVar: "--yellow-border", icon: "◆" },
    cleaning: { label: t.queue.tableStatus.cleaning, colorVar: "--cyan", bgVar: "--cyan-bg", borderVar: "--cyan-border", icon: "✦" },
  };

  const regularTables = tables.filter((t) => !isRoom(t));
  const rooms = tables.filter((t) => isRoom(t));

  const stats = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  const statusOrder: StatusAction[] = ["available", "occupied", "reserved", "cleaning"];

  function handleTableClick(table: Table) {
    if (!onStatusChange) return;
    setActiveTable((prev) => prev === table.id ? null : table.id);
  }

  function handleSetStatus(table: Table, status: StatusAction) {
    if (status === "reserved" && onReserve) {
      onReserve(table);
      setActiveTable(null);
      return;
    }
    onStatusChange?.(table.id, status);
    setActiveTable(null);
  }

  function renderCard(table: Table) {
    const cfg = tableStatusConfig[table.status];
    const isActive = activeTable === table.id;
    const room = isRoom(table);
    return (
      <div key={table.id} className="relative">
        <div
          onClick={() => handleTableClick(table)}
          style={{
            background: `var(${cfg.bgVar})`,
            border: `1.5px solid var(${cfg.borderVar})`,
            boxShadow: isActive ? `0 0 12px var(${cfg.borderVar})` : "var(--card-shadow)",
          }}
          className={`rounded-xl ${room ? "p-3 md:p-4" : "p-2.5 md:p-3"} flex flex-col gap-1 md:gap-1.5 cursor-pointer transition-all hover:translate-y-[-2px] hover:brightness-110 select-none`}
        >
          <div className="flex items-center justify-between">
            <span style={{ color: "var(--text-primary)" }} className="font-bold text-xs md:text-sm">
              {room && "🏛️ "}{displayLabel(table)}
            </span>
            <span style={{ color: `var(${cfg.colorVar})` }} className="text-base md:text-lg">{cfg.icon}</span>
          </div>
          <div style={{ color: "var(--text-muted)" }} className="text-[10px] md:text-xs">👥 {table.capacity} {t.common.seats}</div>
          {table.status === "reserved" && table.reservedTime && (
            <div style={{ color: "var(--yellow)" }} className="text-[10px] font-semibold truncate">
              🕐 {formatTime(table.reservedTime)} · {table.reservedBy}
            </div>
          )}
          <div
            style={{ background: `var(${cfg.bgVar})`, color: `var(${cfg.colorVar})`, border: `1px solid var(${cfg.borderVar})` }}
            className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full text-center"
          >
            {cfg.label}
          </div>
        </div>
        {isActive && onStatusChange && (
          <div
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
            className="absolute z-20 top-full mt-1 left-0 right-0 rounded-xl p-1.5 flex flex-col gap-1 animate-fade-in"
          >
            {statusOrder.filter((s) => s !== table.status).map((s) => {
              const sc = tableStatusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => handleSetStatus(table, s)}
                  style={{ color: `var(${sc.colorVar})` }}
                  className="text-[10px] font-semibold px-2 py-1.5 rounded-lg transition-all hover:bg-[var(--bg-hover)] text-left flex items-center gap-1.5"
                >
                  <span>{sc.icon}</span> {sc.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap gap-2 md:gap-3">
        {Object.entries(tableStatusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span style={{ background: `var(${cfg.colorVar})` }} className="w-2 h-2 rounded-full" />
            <span style={{ color: "var(--text-secondary)" }} className="text-[10px] md:text-xs">{cfg.label} <span style={{ color: "var(--text-dim)" }}>({stats[key as keyof typeof stats]})</span></span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-3">
        {regularTables.map(renderCard)}
      </div>

      {rooms.length > 0 && (
        <>
          <div className="flex items-center gap-2 mt-2">
            <span style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">🏛️ {t.queue.banquetRooms}</span>
            <span style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }} className="text-[10px] px-2 py-0.5 rounded-full">{rooms.length} {t.queue.rooms}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
            {rooms.map(renderCard)}
          </div>
        </>
      )}
    </div>
  );
}
