"use client";

import { Table } from "@/types";

const tableStatusConfig = {
  available: { label: "ว่าง", color: "#98c379", bg: "#1e2a1e", border: "#98c37944" },
  occupied: { label: "มีลูกค้า", color: "#e06c75", bg: "#2a1a1a", border: "#e06c7544" },
  reserved: { label: "จอง", color: "#e5c07b", bg: "#2a2010", border: "#e5c07b44" },
  cleaning: { label: "ทำความสะอาด", color: "#56b6c2", bg: "#1a2a2a", border: "#56b6c244" },
};

function TableCard({ table }: { table: Table }) {
  const cfg = tableStatusConfig[table.status];
  return (
    <div
      style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
      className="rounded-xl p-3 flex flex-col gap-1.5 cursor-pointer hover:brightness-110 transition-all select-none"
    >
      <div className="flex items-center justify-between">
        <span className="text-white font-bold text-sm">T{table.number}</span>
        <span style={{ color: cfg.color }} className="text-lg">
          {table.status === "available" ? "✓" :
           table.status === "occupied" ? "●" :
           table.status === "reserved" ? "◆" : "✦"}
        </span>
      </div>
      <div style={{ color: "#636d83" }} className="text-xs">
        {table.capacity} ที่นั่ง
      </div>
      <div
        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        className="text-xs font-semibold px-2 py-0.5 rounded-full text-center"
      >
        {cfg.label}
      </div>
    </div>
  );
}

export default function FloorMap({ tables }: { tables: Table[] }) {
  const stats = {
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(tableStatusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span style={{ background: cfg.color }} className="w-2 h-2 rounded-full" />
            <span style={{ color: "#abb2bf" }} className="text-xs">
              {cfg.label}{" "}
              <span style={{ color: "#636d83" }}>
                ({stats[key as keyof typeof stats]})
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map((table) => (
          <TableCard key={table.id} table={table} />
        ))}
      </div>
    </div>
  );
}
