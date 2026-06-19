"use client";

import { Table } from "@/types";

const tableStatusConfig = {
  available: { label: "ว่าง", colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border", icon: "✓" },
  occupied: { label: "มีลูกค้า", colorVar: "--red", bgVar: "--red-bg", borderVar: "--red-border", icon: "●" },
  reserved: { label: "จอง", colorVar: "--yellow", bgVar: "--yellow-bg", borderVar: "--yellow-border", icon: "◆" },
  cleaning: { label: "ทำความสะอาด", colorVar: "--cyan", bgVar: "--cyan-bg", borderVar: "--cyan-border", icon: "✦" },
};

function TableCard({ table }: { table: Table }) {
  const cfg = tableStatusConfig[table.status];
  return (
    <div style={{ background: `var(${cfg.bgVar})`, border: `1.5px solid var(${cfg.borderVar})`, boxShadow: "var(--card-shadow)" }} className="rounded-xl p-2.5 md:p-3 flex flex-col gap-1 md:gap-1.5 cursor-pointer transition-all hover:translate-y-[-2px] hover:brightness-110 select-none">
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--text-primary)" }} className="font-bold text-xs md:text-sm">T{table.number}</span>
        <span style={{ color: `var(${cfg.colorVar})` }} className="text-base md:text-lg">{cfg.icon}</span>
      </div>
      <div style={{ color: "var(--text-muted)" }} className="text-[10px] md:text-xs">👥 {table.capacity} ที่นั่ง</div>
      <div style={{ background: `var(${cfg.bgVar})`, color: `var(${cfg.colorVar})`, border: `1px solid var(${cfg.borderVar})` }} className="text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full text-center">{cfg.label}</div>
    </div>
  );
}

export default function FloorMap({ tables }: { tables: Table[] }) {
  const stats = { available: tables.filter((t) => t.status === "available").length, occupied: tables.filter((t) => t.status === "occupied").length, reserved: tables.filter((t) => t.status === "reserved").length, cleaning: tables.filter((t) => t.status === "cleaning").length };

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
        {tables.map((table) => <TableCard key={table.id} table={table} />)}
      </div>
    </div>
  );
}
