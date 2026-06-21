"use client";

import { useState, useEffect, useCallback } from "react";
import FloorMap from "@/components/queue/FloorMap";
import QueueList from "@/components/queue/QueueList";
import NewQueueModal from "@/components/queue/NewQueueModal";
import AssignTableModal from "@/components/queue/AssignTableModal";
import ReserveTableModal from "@/components/queue/ReserveTableModal";
import { QueueEntry, Table } from "@/types";
import { fetchQueue, fetchTables, createQueueEntry, updateQueueStatus, updateTableStatus, reserveTable, cancelExpiredReservations, getNextQueueNumber } from "@/lib/supabase/queries";
import { useI18n } from "@/lib/i18n-context";

export default function QueuePage() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewQueue, setShowNewQueue] = useState(false);
  const [seatEntryId, setSeatEntryId] = useState<string | null>(null);
  const [reserveTableTarget, setReserveTableTarget] = useState<Table | null>(null);
  const [nextQueueNum, setNextQueueNum] = useState(1);

  const checkExpiredReservations = useCallback(async () => {
    try {
      const cancelledIds = await cancelExpiredReservations();
      if (cancelledIds.length > 0) {
        setTables((prev) =>
          prev.map((t) =>
            cancelledIds.includes(t.id) ? { ...t, status: "available", reservedBy: undefined, reservedTime: undefined } : t
          )
        );
      }
    } catch (e) {
      console.error("Failed to cancel expired reservations:", e);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchQueue(), fetchTables(), getNextQueueNumber()])
      .then(async ([q, tbl, num]) => {
        setEntries(q);
        setTables(tbl);
        setNextQueueNum(num);
        await cancelExpiredReservations().then((ids) => {
          if (ids.length > 0) {
            setTables((prev) =>
              prev.map((t) => ids.includes(t.id) ? { ...t, status: "available", reservedBy: undefined, reservedTime: undefined } : t)
            );
          }
        }).catch(console.error);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(checkExpiredReservations, 30000);
    return () => clearInterval(interval);
  }, [checkExpiredReservations]);

  const regularTables = tables.filter((t) => t.number < 100);
  const rooms = tables.filter((t) => t.number >= 100);
  const waiting = entries.filter((q) => q.status === "waiting").length;
  const called = entries.filter((q) => q.status === "called").length;
  const available = regularTables.filter((t) => t.status === "available").length;
  const occupied = regularTables.filter((t) => t.status === "occupied").length;
  const roomsAvailable = rooms.filter((t) => t.status === "available").length;
  const roomsReserved = rooms.filter((t) => t.status === "reserved").length;

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
    setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, status, reservedBy: undefined, reservedTime: undefined } : t));
    try {
      await updateTableStatus(tableId, status);
    } catch (e) {
      console.error("Failed to update table status:", e);
    }
  }

  async function handleReserve(reservedBy: string, reservedTime: Date) {
    if (!reserveTableTarget) return;
    const tableId = reserveTableTarget.id;
    setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, status: "reserved" as const, reservedBy, reservedTime } : t));
    try {
      await reserveTable(tableId, reservedBy, reservedTime);
    } catch (e) {
      console.error("Failed to reserve table:", e);
    }
    setReserveTableTarget(null);
  }

  async function handleCancelReservation(tableId: string) {
    setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, status: "available" as const, reservedBy: undefined, reservedTime: undefined } : t));
    try {
      await updateTableStatus(tableId, "available");
    } catch (e) {
      console.error("Failed to cancel reservation:", e);
    }
  }

  const reservedTables = tables
    .filter((t) => t.status === "reserved" && t.reservedTime)
    .sort((a, b) => (a.reservedTime!.getTime()) - (b.reservedTime!.getTime()));

  const seatEntry = seatEntryId ? entries.find((e) => e.id === seatEntryId) : null;

  if (loading) {
    return <div className="flex items-center justify-center h-full page-bg"><span style={{ color: "var(--text-dim)" }} className="text-sm">{t.common.loading}</span></div>;
  }

  return (
    <>
      {showNewQueue && <NewQueueModal nextNumber={nextQueueNum} onClose={() => setShowNewQueue(false)} onSubmit={handleNewQueue} />}
      {seatEntry && <AssignTableModal entry={seatEntry} tables={tables} onAssign={assignTable} onClose={() => setSeatEntryId(null)} />}
      {reserveTableTarget && <ReserveTableModal table={reserveTableTarget} onConfirm={handleReserve} onClose={() => setReserveTableTarget(null)} />}

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

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 animate-fade-in">
          {[
            { label: t.queue.waitingQueue, value: waiting, v: "--yellow", icon: "⏳" },
            { label: t.queue.called, value: called, v: "--blue", icon: "📢" },
            { label: t.queue.tableAvailable, value: available, v: "--green", icon: "✅" },
            { label: t.queue.tableOccupied, value: occupied, v: "--red", icon: "👥" },
            { label: t.queue.roomAvailable, value: roomsAvailable, v: "--cyan", icon: "🏛️" },
            { label: t.queue.roomReserved, value: roomsReserved, v: "--yellow", icon: "📋" },
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

        {reservedTables.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📋 {t.queue.reservation.summary}</h2>
              <span style={{ background: "var(--yellow-bg)", color: "var(--yellow)", border: "1px solid var(--yellow-border)" }} className="text-xs px-2 py-0.5 rounded-full font-semibold">
                {t.queue.reservation.summaryCount.replace("{n}", String(reservedTables.length))}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
              {reservedTables.map((table) => {
                const isRoom = table.number >= 100;
                const label = isRoom ? `R${table.number - 100}` : `T${table.number}`;
                const now = new Date();
                const resTime = table.reservedTime!;
                const isToday = resTime.toDateString() === now.toDateString();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const isTomorrow = resTime.toDateString() === tomorrow.toDateString();
                const dateLabel = isToday ? t.queue.reservation.today : isTomorrow ? t.queue.reservation.tomorrow : `${resTime.getDate()}/${resTime.getMonth() + 1}`;
                const timeStr = `${String(resTime.getHours()).padStart(2, "0")}:${String(resTime.getMinutes()).padStart(2, "0")}`;
                const isExpired = resTime < now;

                return (
                  <div
                    key={table.id}
                    style={{
                      background: "var(--yellow-bg)",
                      border: `1.5px solid var(${isExpired ? "--red-border" : "--yellow-border"})`,
                    }}
                    className="rounded-xl p-3 flex items-center gap-3"
                  >
                    <div
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <span style={{ color: "var(--text-primary)" }} className="font-bold text-xs">{isRoom ? "🏛️" : "🪑"}{label}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ color: "var(--text-primary)" }} className="font-semibold text-sm truncate">
                        {table.reservedBy}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: isExpired ? "var(--red)" : "var(--yellow)" }} className="text-xs font-semibold">
                          🕐 {dateLabel} {timeStr}
                        </span>
                        {isExpired && (
                          <span style={{ background: "var(--red-bg)", color: "var(--red)", border: "1px solid var(--red-border)" }} className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                            {t.queue.reservation.expired}
                          </span>
                        )}
                      </div>
                      <div style={{ color: "var(--text-dim)" }} className="text-[10px]">
                        👥 {table.capacity} {t.common.seats}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelReservation(table.id)}
                      style={{ color: "var(--red)" }}
                      className="text-xs font-semibold hover:opacity-70 transition shrink-0 px-2 py-1 rounded-lg hover:bg-[var(--red-bg)]"
                    >
                      ✕ {t.queue.reservation.cancelReservation}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            <FloorMap tables={tables} onStatusChange={handleTableStatusChange} onReserve={(table) => setReserveTableTarget(table)} />
          </div>
        </div>
      </div>
    </>
  );
}
