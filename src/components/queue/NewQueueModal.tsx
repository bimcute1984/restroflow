"use client";

import { useState } from "react";
import { QueueEntry } from "@/types";

export default function NewQueueModal({
  nextNumber,
  onClose,
  onSubmit,
}: {
  nextNumber: number;
  onClose: () => void;
  onSubmit: (entry: QueueEntry) => void;
}) {
  const [name, setName] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [phone, setPhone] = useState("");

  function handleSubmit() {
    if (!name.trim()) return;
    const entry: QueueEntry = {
      id: `Q-${Date.now()}`,
      queueNumber: nextNumber,
      customerName: name.trim(),
      partySize,
      phone: phone.trim() || undefined,
      status: "waiting",
      createdAt: new Date(),
    };
    onSubmit(entry);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "#0008" }}
    >
      <div
        style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          style={{ borderBottom: "1px solid #2d3141" }}
          className="p-5 flex items-center justify-between"
        >
          <h2 className="text-white font-bold text-lg">รับคิวใหม่</h2>
          <button onClick={onClose} style={{ color: "#636d83" }} className="text-xl font-bold">
            ✕
          </button>
        </div>

        {/* Queue number preview */}
        <div className="flex justify-center py-6">
          <div
            style={{ background: "#2a2010", border: "2px solid #e5c07b44" }}
            className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center gap-1"
          >
            <span style={{ color: "#636d83" }} className="text-xs">คิวที่</span>
            <span style={{ color: "#e5c07b" }} className="text-4xl font-bold">{nextNumber}</span>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 pb-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label style={{ color: "#636d83" }} className="text-xs font-semibold">
              ชื่อลูกค้า <span style={{ color: "#e06c75" }}>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อลูกค้า"
              autoFocus
              style={{
                background: "#0f1117",
                border: "1px solid #2d3141",
                color: "#fff",
              }}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "#636d83" }} className="text-xs font-semibold">
              จำนวนคน
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                style={{ background: "#2d3141", color: "#abb2bf" }}
                className="w-9 h-9 rounded-xl font-bold text-lg"
              >
                −
              </button>
              <span className="text-white font-bold text-xl w-8 text-center">{partySize}</span>
              <button
                onClick={() => setPartySize((p) => Math.min(20, p + 1))}
                style={{ background: "#2a2010", color: "#e5c07b" }}
                className="w-9 h-9 rounded-xl font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label style={{ color: "#636d83" }} className="text-xs font-semibold">
              เบอร์โทร (ไม่บังคับ)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0xx-xxx-xxxx"
              style={{
                background: "#0f1117",
                border: "1px solid #2d3141",
                color: "#fff",
              }}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={
              name.trim()
                ? { background: "#2a2010", color: "#e5c07b" }
                : { background: "#2d3141", color: "#636d83" }
            }
            className="w-full py-3 rounded-xl font-bold text-sm mt-1"
          >
            รับคิว #{nextNumber}
          </button>
        </div>
      </div>
    </div>
  );
}
