"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { mockDailySales, mockHourlySales, mockTopMenuItems } from "@/lib/mock-data";

function StatCard({
  label, value, sub, color,
}: {
  label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div
      style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
      className="rounded-xl p-5"
    >
      <div style={{ color: "#636d83" }} className="text-xs mb-2">{label}</div>
      <div style={{ color }} className="text-2xl font-bold">{value}</div>
      {sub && <div style={{ color: "#636d83" }} className="text-xs mt-1">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean; payload?: { value: number; color: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
      className="rounded-xl px-3 py-2 text-sm"
    >
      <p style={{ color: "#636d83" }} className="text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {typeof p.value === "number" && p.value > 100
            ? `฿${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const today = mockDailySales[mockDailySales.length - 1];
  const yesterday = mockDailySales[mockDailySales.length - 2];
  const weekRevenue = mockDailySales.reduce((s, d) => s + d.revenue, 0);
  const weekOrders = mockDailySales.reduce((s, d) => s + d.orders, 0);
  const revenueChange = (((today.revenue - yesterday.revenue) / yesterday.revenue) * 100).toFixed(1);

  const peakHour = mockHourlySales.reduce((a, b) => (a.orders > b.orders ? a : b));

  const dailyChartData = mockDailySales.map((d) => ({
    date: d.date.slice(5),
    revenue: d.revenue,
    orders: d.orders,
  }));

  const hourlyData = mockHourlySales.map((h) => ({
    hour: `${h.hour}:00`,
    orders: h.orders,
  }));

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">รายงานและวิเคราะห์</h1>
          <p style={{ color: "#636d83" }} className="text-sm mt-1">Analytics &amp; Reports</p>
        </div>
        <button
          style={{ background: "#1e2a1e", color: "#98c379" }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
        >
          ⬇ Export
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="ยอดขายวันนี้"
          value={`฿${today.revenue.toLocaleString()}`}
          sub={`${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% จากเมื่อวาน`}
          color="#98c379"
        />
        <StatCard
          label="ออเดอร์วันนี้"
          value={today.orders}
          sub={`เฉลี่ย ฿${today.avgPerOrder}/ออเดอร์`}
          color="#61afef"
        />
        <StatCard
          label="ยอดขาย 7 วัน"
          value={`฿${weekRevenue.toLocaleString()}`}
          sub={`${weekOrders} ออเดอร์`}
          color="#e5c07b"
        />
        <StatCard
          label="ช่วง Peak"
          value={`${peakHour.hour}:00`}
          sub={`${peakHour.orders} ออเดอร์`}
          color="#c678dd"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue area chart — spans 2 cols */}
        <div
          style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
          className="lg:col-span-2 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">ยอดขาย 7 วัน</h2>
            <span style={{ color: "#636d83" }} className="text-xs">บาท</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#98c379" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#98c379" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3141" />
              <XAxis dataKey="date" stroke="#636d83" tick={{ fontSize: 11 }} />
              <YAxis stroke="#636d83" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#98c379"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders bar chart */}
        <div
          style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
          className="rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">จำนวนออเดอร์</h2>
            <span style={{ color: "#636d83" }} className="text-xs">7 วัน</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3141" />
              <XAxis dataKey="date" stroke="#636d83" tick={{ fontSize: 11 }} />
              <YAxis stroke="#636d83" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#61afef" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top menu */}
        <div
          style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
          className="rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold text-sm mb-4">
            เมนูขายดี Top 5
          </h2>
          <div className="flex flex-col gap-3">
            {mockTopMenuItems.map((t, i) => {
              const maxQty = mockTopMenuItems[0].totalQty;
              const pct = (t.totalQty / maxQty) * 100;
              return (
                <div key={t.menuItem.id} className="flex items-center gap-3">
                  <span
                    style={{ color: i === 0 ? "#e5c07b" : "#636d83" }}
                    className="text-sm font-bold w-4 shrink-0"
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-xs font-medium truncate">
                        {t.menuItem.name}
                      </span>
                      <span style={{ color: "#636d83" }} className="text-xs shrink-0 ml-2">
                        {t.totalQty} จาน
                      </span>
                    </div>
                    <div
                      style={{ background: "#2d3141" }}
                      className="h-1.5 rounded-full overflow-hidden"
                    >
                      <div
                        style={{ width: `${pct}%`, background: i === 0 ? "#e5c07b" : "#61afef" }}
                        className="h-full rounded-full"
                      />
                    </div>
                  </div>
                  <span style={{ color: "#98c379" }} className="text-xs font-semibold shrink-0 w-16 text-right">
                    ฿{t.totalRevenue.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly bar */}
        <div
          style={{ background: "#1a1d27", border: "1px solid #2d3141" }}
          className="rounded-2xl p-5"
        >
          <h2 className="text-white font-semibold text-sm mb-4">
            ช่วงเวลาที่ลูกค้าเยอะ
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3141" />
              <XAxis dataKey="hour" stroke="#636d83" tick={{ fontSize: 10 }} />
              <YAxis stroke="#636d83" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#c678dd" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
