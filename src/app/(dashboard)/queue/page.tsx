"use client";

import { useState } from "react";
import FloorMap from "@/components/queue/FloorMap";
import QueueList from "@/components/queue/QueueList";
import NewQueueModal from "@/components/queue/NewQueueModal";
import AssignTableModal from "@/components/queue/AssignTableModal";
import { mockQueue, mockTables } from "@/lib/mock-data";
import { QueueEntry, Table } from "@/types";

export default function QueuePage() {
  const [entries, setEntries] = useState<QueueEntry[]>(mockQueue);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [showNewQueue, setShowNewQueue] = useState(false);
  const [seatEntryId, setSeatEntryId] = useState<string | null>(null);

  const waiting = entries.filter((q) => q.status === "waiting").length;
  const called = entries.filter((q) => q.status === "called").length;
  const available = tables.filter((t) => t.status === "available").length;
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const nextQueueNumber = entries.length > 0 ? Math.max(...entries.map((e) => e.queueNumber)) + 1 : 1;

  function callQueue(id: string) { setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: "called", calledAt: new Date() } : e)); }
  function assignTable(tableId: string) {
    if (!seatEntryId) return;
    setEntries((prev) => prev.map((e) => e.id === seatEntryId ? { ...e, status: "seated", tableId } : e));
    setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, status: "occupied" } : t));
    setSeatEntryId(null);
  }
  const seatEntry = seatEntryId ? entries.find((e) => e.id === seatEntryId) : null;

  return (
    <>
      {showNewQueue && <NewQueueModal nextNumber={nextQueueNumber} onClose={() => setShowNewQueue(false)} onSubmit={(entry) => { setEntries((prev) => [...prev, entry]); setShowNewQueue(false); }} />}
      {seatEntry && <AssignTableModal entry={seatEntry} tables={tables} onAssign={assignTable} onClose={() => setSeatEntryId(null)} />}

      <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">คิวและโต๊ะ</h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">Queue &amp; Table Management</p>
          </div>
          <button onClick={() => setShowNewQueue(true)} style={{ background: "var(--yellow-grad)", color: "#1a1a0e", boxShadow: "0 2px 12px var(--yellow-border)" }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]">
            + <span className="hidden sm:inline">รับคิวใหม่</span><span className="sm:hidden">เพิ่มคิว</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {[
            { label: "รอคิว", value: waiting, v: "--yellow", icon: "⏳" },
            { label: "เรียกแล้ว", value: called, v: "--blue", icon: "📢" },
            { label: "โต๊ะว่าง", value: available, v: "--green", icon: "✅" },
            { label: "โต๊ะมีลูกค้า", value: occupied, v: "--red", icon: "👥" },
          ].map((s) => (
            <div key={s.label} className="stat-card p-4">
              <div className="glow" style={{ background: `var(${s.v})` }} />
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div style={{ color: `var(${s.v})` }} className="text-xl md:text-2xl font-bold">{s.value}</div>
                  <div style={{ color: "var(--text-muted)" }} className="text-xs mt-1">{s.label}</div>
                </div>
                <span className="text-lg opacity-60">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 md:gap-6 animate-fade-in">
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📋 คิวรอ</h2>
              <span style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }} className="text-xs px-2 py-0.5 rounded-full">{waiting + called} คิว</span>
            </div>
            <QueueList entries={entries} onCall={callQueue} onSeat={(id) => setSeatEntryId(id)} />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">🗺️ แผนผังโต๊ะ</h2>
              <span style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }} className="text-xs px-2 py-0.5 rounded-full">{tables.length} โต๊ะ</span>
            </div>
            <FloorMap tables={tables} />
          </div>
        </div>
      </div>
    </>
  );
}
