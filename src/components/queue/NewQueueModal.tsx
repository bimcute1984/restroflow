"use client";

import { useState } from "react";
import { QueueEntry } from "@/types";

export default function NewQueueModal({ nextNumber, onClose, onSubmit }: { nextNumber: number; onClose: () => void; onSubmit: (entry: QueueEntry) => void }) {
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [phone, setPhone] = useState("");

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({ id: `Q-${Date.now()}`, queueNumber: nextNumber, customerName: name.trim(), partySize, phone: phone.trim() || undefined, status: "waiting", createdAt: new Date() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay" onClick={onClose}>
      <div className="modal-content w-full sm:max-w-sm overflow-hidden animate-slide-up rounded-t-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div style={{ borderBottom: "1px solid var(--border)" }} className="p-4 md:p-5 flex items-center justify-between">
          <h2 style={{ color: "var(--text-primary)" }} className="font-bold text-base md:text-lg">🪑 รับคิวใหม่</h2>
          <button onClick={onClose} style={{ color: "var(--text-dim)" }} className="text-xl font-bold hover:opacity-70 transition">✕</button>
        </div>
        <div className="flex justify-center py-5 md:py-6">
          <div style={{ background: "var(--yellow-bg)", border: "2px solid var(--yellow-border)" }} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center gap-1">
            <span style={{ color: "var(--text-muted)" }} className="text-[10px] md:text-xs">คิวที่</span>
            <span style={{ color: "var(--yellow)" }} className="text-3xl md:text-4xl font-bold">{nextNumber}</span>
          </div>
        </div>
        <div className="px-4 pb-4 md:px-5 md:pb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">ชื่อลูกค้า <span style={{ color: "var(--red)" }}>*</span></label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="กรอกชื่อลูกค้า" autoFocus className="input-styled w-full py-2.5" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">จำนวนคน</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setPartySize((p) => Math.max(1, p - 1))} style={{ background: "var(--border)", color: "var(--text-secondary)" }} className="w-9 h-9 rounded-xl font-bold text-lg">−</button>
              <span style={{ color: "var(--text-primary)" }} className="font-bold text-xl w-8 text-center">{partySize}</span>
              <button onClick={() => setPartySize((p) => Math.min(20, p + 1))} style={{ background: "var(--yellow-bg)", color: "var(--yellow)" }} className="w-9 h-9 rounded-xl font-bold text-lg">+</button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "var(--text-muted)" }} className="text-xs font-semibold">เบอร์โทร (ไม่บังคับ)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0xx-xxx-xxxx" className="input-styled w-full py-2.5" />
          </div>
          <button onClick={handleSubmit} disabled={!name.trim()}
            style={name.trim() ? { background: "var(--yellow-grad)", color: "#1a1a0e", boxShadow: "0 2px 12px var(--yellow-border)" } : { background: "var(--border)", color: "var(--text-dim)" }}
            className="w-full py-3 rounded-xl font-bold text-sm mt-1 transition-all">
            รับคิว #{nextNumber}
          </button>
        </div>
      </div>
    </div>
  );
}
