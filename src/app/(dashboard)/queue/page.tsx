import FloorMap from "@/components/queue/FloorMap";
import QueueList from "@/components/queue/QueueList";
import { mockQueue, mockTables } from "@/lib/mock-data";

export default function QueuePage() {
  const waiting = mockQueue.filter((q) => q.status === "waiting").length;
  const called = mockQueue.filter((q) => q.status === "called").length;
  const available = mockTables.filter((t) => t.status === "available").length;
  const occupied = mockTables.filter((t) => t.status === "occupied").length;

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">คิวและโต๊ะ</h1>
          <p style={{ color: "#636d83" }} className="text-sm mt-1">
            Queue &amp; Table Management
          </p>
        </div>
        <button
          style={{ background: "#2a2010", color: "#e5c07b" }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
        >
          + รับคิวใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "รอคิว", value: waiting, color: "#e5c07b" },
          { label: "เรียกแล้ว", value: called, color: "#61afef" },
          { label: "โต๊ะว่าง", value: available, color: "#98c379" },
          { label: "โต๊ะมีลูกค้า", value: occupied, color: "#e06c75" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
            className="rounded-xl p-4"
          >
            <div style={{ color: s.color }} className="text-2xl font-bold">
              {s.value}
            </div>
            <div style={{ color: "#636d83" }} className="text-xs mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main content — Queue left, Floor map right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Queue list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">คิวรอ</h2>
            <span
              style={{ background: "#2d3141", color: "#636d83" }}
              className="text-xs px-2 py-0.5 rounded-full"
            >
              {waiting + called} คิว
            </span>
          </div>
          <QueueList entries={mockQueue} />
        </div>

        {/* Floor map */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">แผนผังโต๊ะ</h2>
            <span
              style={{ background: "#2d3141", color: "#636d83" }}
              className="text-xs px-2 py-0.5 rounded-full"
            >
              {mockTables.length} โต๊ะ
            </span>
          </div>
          <FloorMap tables={mockTables} />
        </div>
      </div>
    </div>
  );
}
