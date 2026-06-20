"use client";

import { useState, useEffect } from "react";
import FloorMap from "@/components/queue/FloorMap";
import QueueList from "@/components/queue/QueueList";
import NewQueueModal from "@/components/queue/NewQueueModal";
import AssignTableModal from "@/components/queue/AssignTableModal";
import { QueueEntry, Table } from "@/types";
import { fetchQueue, fetchTables, createQueueEntry, updateQueueStatus, updateTableStatus, getNextQueueNumber } from "@/lib/supabase/queries";
import { useI18n } from "@/lib/i18n-context";

export default function QueuePage() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewQueue, setShowNewQueue] = useState(false);
  const [seatEntryId, setSeatEntryId] = useState<string | null>(null);
  const [nextQueueNum, setNextQueueNum] = useState(1);

  useEffect(() => {
    Promise.all([fetchQueue(), fetchTables(), getNextQueueNumber()])
      .then(([q, tbl, num]) => { setEntries(q); setTables(tbl); setNextQueueNum(num); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const waiting = entries.filter((q) => q.status === "waiting").length;
  const called = entries.filter((q) => q.status === "called").length;
  const available = tables.filter((t) => t.status === "available").length;
  const occupied = tables.filter((t) => t.status === "occupied").length;

  async function callQueue(id: string) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: "called" as const, calledAt: new Date() } : e));
    try {
      await updateQueueStatus(id, "called");
    } catch (e) {
      console.error("Failed to call queue:", e);
    }
  }

  async function assignTable(tableId: string) {
    if (!seatEntryId) return;
    setEntries((prev) => prev.map((e) => e.id === seatEntryId ? { ...e, status: "seated" as const, tableId } : e));
    setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, status: "occupied" as const } : t));
    try {
      await updateQueueStatus(seatEntryId, "seated", tableId);
      await updateTableStatus(tableId, "occupied");
    } catch (e) {
      console.error("Failed to assign table:", e);
    }
    setSeatEntryId(null);
  }

  async function handleNewQueue(entry: QueueEntry) {
    try {
      const id = await createQueueEntry({
        queueNumber: entry.queueNumber,
        customerName: entry.customerName,
        partySize: entry.partySize,
        phone: entry.phone,
      });
      setEntries((prev) => [...prev, { ...entry, id }]);
      setNextQueueNum((n) => n + 1);
    } catch (e) {
      console.error("Failed to create queue entry:", e);
    }
    setShowNewQueue(false);
  }

  async function handleTableStatusChange(tableId: string, status: Table["status"]) {
    setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, status } : t));
    try {
      await updateTableStatus(tableId, status);
    } catch (e) {
      console.error("Failed to update table status:", e);
    }
  }

  const seatEntry = seatEntryId ? entries.find((e) => e.id === seatEntryId) : null;

  if (loading) {
    return <div className="flex items-center justify-center h-full page-bg"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.common.loading}</span></div>;
  }

  return (
    <>
      {showNewQueue && <NewQueueModal nextNumber={nextQueueNum} onClose={() => setShowNewQueue(false)} onSubmit={handleNewQueue} />}
      {seatEntry && <AssignTableModal entry={seatEntry} tables={tables} onAssign={assignTable} onClose={() => setSeatEntryId(null)} />}

      <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">{t.queue.title}</h1>
            <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">{t.queue.subtitle}</p>
          </div>
          <button onClick={() => setShowNewQueue(true)} style={{ background: "var(--yellow-grad)", color: "#1a1a0e", boxShadow: "0 2px 12px var(--yellow-border)" }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]">
            + <span className="hidden sm:inline">{t.queue.newQueue}</span><span className="sm:hidden">{t.queue.addQueue}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          {[
            { label: t.queue.waitingQueue, value: waiting, v: "--yellow", icon: "⏳" },
            { label: t.queue.called, value: called, v: "--blue", icon: "📢" },
            { label: t.queue.tableAvailable, value: available, v: "--green", icon: "✅" },
            { label: t.queue.tableOccupied, value: occupied, v: "--red", icon: "👥" },
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
              <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📋 {t.queue.queueWait}</h2>
              <span style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }} className="text-xs px-2 py-0.5 rounded-full">{waiting + called} {t.queue.inQueue}</span>
            </div>
            <QueueList entries={entries} onCall={callQueue} onSeat={(id) => setSeatEntryId(id)} />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">🗺️ {t.queue.floorMap}</h2>
              <span style={{ background: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }} className="text-xs px-2 py-0.5 rounded-full">{tables.length} {t.queue.tables}</span>
            </div>
            <FloorMap tables={tables} onStatusChange={handleTableStatusChange} />
          </div>
        </div>
      </div>
    </>
  );
}
