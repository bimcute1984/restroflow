"use client";

import { QueueEntry, Table } from "@/types";

const statusCfg = {
  available: { label: "ว่าง", color: "#98c379", bg: "#1e2a1e", border: "#98c37944" },
  occupied: { label: "มีลูกค้า", color: "#e06c75", bg: "#2a1a1a", border: "#e06c7544" },
  reserved: { label: "จอง", color: "#e5c07b", bg: "#2a2010", border: "#e5c07b44" },
  cleaning: { label: "ทำความสะอาด", color: "#56b6c2", bg: "#1a2a2a", border: "#56b6c244" },
};

export default function AssignTableModal({
  entry,
  tables,
  onAssign,
  onClose,
}: {
  entry: QueueEntry;
  tables: Table[];
  onAssign: (tableId: string) => void;
  onClose: () => void;
}) {
  const available = tables.filter((t) => t.status === "available");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "#0008" }}
    >
      <div
        style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ borderBottom: "1px solid #2d3141" }}
          className="p-5 flex items-center justify-between"
        >
          <div>
            <h2 className="text-white font-bold text-lg">เลือกโต๊ะ</h2>
            <p style={{ color: "#636d83" }} className="text-xs mt-0.5">
              คิว #{entry.queueNumber} · {entry.customerName} · {entry.partySize} คน
            </p>
          </div>
          <button onClick={onClose} style={{ color: "#636d83" }} className="text-xl font-bold">
            ✕
          </button>
        </div>

        <div className="p-5">
          {available.length === 0 ? (
            <div
              style={{ border: "1.5px dashed #2d3141", color: "#636d83" }}
              className="rounded-2xl p-10 text-center text-sm"
            >
              ไม่มีโต๊ะว่าง
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {tables.map((table) => {
                const cfg = statusCfg[table.status];
                const isAvailable = table.status === "available";
                const fits = table.capacity >= entry.partySize;
                return (
                  <button
                    key={table.id}
                    disabled={!isAvailable}
                    onClick={() => isAvailable && onAssign(table.id)}
                    style={{
                      background: cfg.bg,
                      border: `1.5px solid ${isAvailable && fits ? "#98c379" : cfg.border}`,
                      opacity: !isAvailable ? 0.4 : 1,
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      outline: isAvailable && fits ? "none" : "none",
                    }}
                    className="rounded-xl p-3 flex flex-col gap-1 transition-all hover:brightness-125"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">T{table.number}</span>
                      {isAvailable && fits && (
                        <span style={{ color: "#98c379" }} className="text-xs">✓</span>
                      )}
                    </div>
                    <div style={{ color: "#636d83" }} className="text-xs">
                      {table.capacity} ที่นั่ง
                    </div>
                    <div
                      style={{ color: cfg.color }}
                      className="text-xs font-semibold"
                    >
                      {cfg.label}
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
