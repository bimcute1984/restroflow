"use client";

import { useState, useEffect } from "react";
import { QueueEntry, QueueStatus } from "@/types";
import { useI18n } from "@/lib/i18n-context";

export default function QueueList({ entries, onCall, onSeat }: { entries: QueueEntry[]; onCall?: (id: string) => void; onSeat?: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  const { t } = useI18n();
  useEffect(() => setMounted(true), []);
  const active = entries.filter((e) => e.status === "waiting" || e.status === "called");

  const statusCfg: Record<QueueStatus, { label: string; colorVar: string; bgVar: string; borderVar: string }> = {
    waiting: { label: t.queue.queueStatus.waiting, colorVar: "--yellow", bgVar: "--yellow-bg", borderVar: "--yellow-border" },
    called: { label: t.queue.queueStatus.called, colorVar: "--blue", bgVar: "--blue-bg", borderVar: "--blue-border" },
    seated: { label: t.queue.queueStatus.seated, colorVar: "--green", bgVar: "--green-bg", borderVar: "--green-border" },
    cancelled: { label: t.queue.queueStatus.cancelled, colorVar: "--text-muted", bgVar: "--bg-card", borderVar: "--border" },
  };

  function timeWaiting(date: Date) {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return t.queue.timeWaiting.justArrived;
    return t.queue.timeWaiting.waitingMin.replace("{n}", String(mins));
  }

  return (
    <div className="flex flex-col gap-3">
      {active.length === 0 && <div style={{ border: "1.5px dashed var(--border)", color: "var(--text-dim)" }} className="rounded-2xl p-10 text-center text-sm">{t.queue.noQueue}</div>}
      {active.map((entry) => {
        const cfg = statusCfg[entry.status];
        return (
          <div key={entry.id} style={{ background: "var(--bg-card)", border: `1.5px solid var(${cfg.borderVar})`, boxShadow: "var(--card-shadow)" }} className="rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-all hover:translate-y-[-1px] animate-slide-up">
            <div style={{ background: `var(${cfg.bgVar})`, color: `var(${cfg.colorVar})`, border: `1px solid var(${cfg.borderVar})` }} className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold text-lg md:text-xl shrink-0">{entry.queueNumber}</div>
            <div className="flex-1 min-w-0">
              <div style={{ color: "var(--text-primary)" }} className="font-semibold text-xs md:text-sm truncate">{entry.customerName}</div>
              <div style={{ color: "var(--text-muted)" }} className="text-[10px] md:text-xs mt-0.5 flex gap-2">
                <span>👥 {entry.partySize} {t.common.people}</span>
                {entry.phone && <span className="hidden sm:inline">📱 {entry.phone}</span>}
              </div>
              <div style={{ color: "var(--text-dim)" }} className="text-[10px] md:text-xs mt-1">{mounted ? timeWaiting(entry.createdAt) : ""}</div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span style={{ background: `var(${cfg.bgVar})`, color: `var(${cfg.colorVar})`, border: `1px solid var(${cfg.borderVar})` }} className="text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-0.5 md:py-1 rounded-full">{cfg.label}</span>
              {entry.status === "waiting" && <button onClick={() => onCall?.(entry.id)} style={{ background: "var(--blue-grad)", color: "#fff" }} className="text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 rounded-lg transition-all hover:translate-y-[-1px]">{t.queue.call}</button>}
              {entry.status === "called" && <button onClick={() => onSeat?.(entry.id)} style={{ background: "var(--green-grad)", color: "#fff" }} className="text-[10px] md:text-xs font-semibold px-2.5 md:px-3 py-1 rounded-lg transition-all hover:translate-y-[-1px]">{t.queue.seat}</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
