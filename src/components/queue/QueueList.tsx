"use client";

import { QueueEntry, QueueStatus } from "@/types";

const statusCfg: Record<QueueStatus, { label: string; color: string; bg: string }> = {
  waiting: { label: "รอ", color: "#e5c07b", bg: "#2a2010" },
  called: { label: "เรียกแล้ว", color: "#61afef", bg: "#1e2d4a" },
  seated: { label: "เข้านั่งแล้ว", color: "#98c379", bg: "#1e2a1e" },
  cancelled: { label: "ยกเลิก", color: "#636d83", bg: "#1a1d27" },
};

function timeWaiting(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "เพิ่งมา";
  return `รอ ${mins} นาที`;
}

export default function QueueList({ entries }: { entries: QueueEntry[] }) {
  const active = entries.filter((e) => e.status === "waiting" || e.status === "called");

  return (
    <div className="flex flex-col gap-3">
      {active.length === 0 && (
        <div
          style={{ border: "1.5px dashed #2d3141", color: "#636d83" }}
          className="rounded-2xl p-10 text-center text-sm"
        >
          ไม่มีคิวรอ
        </div>
      )}

      {active.map((entry) => {
        const cfg = statusCfg[entry.status];
        return (
          <div
            key={entry.id}
            style={{
              background: "#1a1d27",
              border: entry.status === "called"
                ? "1.5px solid #61afef44"
                : "1.5px solid #2d3141",
            }}
            className="rounded-2xl p-4 flex items-center gap-4"
          >
            {/* Queue number */}
            <div
              style={{ background: cfg.bg, color: cfg.color }}
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0"
            >
              {entry.queueNumber}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm truncate">
                {entry.customerName}
              </div>
              <div style={{ color: "#636d83" }} className="text-xs mt-0.5 flex gap-2">
                <span>👥 {entry.partySize} คน</span>
                {entry.phone && <span>📱 {entry.phone}</span>}
              </div>
              <div style={{ color: "#636d83" }} className="text-xs mt-1">
                {timeWaiting(entry.createdAt)}
              </div>
            </div>

            {/* Status + action */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span
                style={{ background: cfg.bg, color: cfg.color }}
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                {cfg.label}
              </span>
              {entry.status === "waiting" && (
                <button
                  style={{ background: "#1e2d4a", color: "#61afef" }}
                  className="text-xs font-semibold px-3 py-1 rounded-lg"
                >
                  เรียก
                </button>
              )}
              {entry.status === "called" && (
                <button
                  style={{ background: "#1e2a1e", color: "#98c379" }}
                  className="text-xs font-semibold px-3 py-1 rounded-lg"
                >
                  เข้านั่ง
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
