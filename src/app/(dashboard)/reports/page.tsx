"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { mockDailySales, mockHourlySales, mockTopMenuItems } from "@/lib/mock-data";
import { useOrders } from "@/lib/order-context";

function StatCard({ label, value, sub, colorVar, icon }: { label: string; value: string | number; sub?: string; colorVar: string; icon: string }) {
  return (
    <div className="stat-card p-4 md:p-5">
      <div className="glow" style={{ background: `var(${colorVar})` }} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div style={{ color: "var(--text-muted)" }} className="text-xs mb-1.5">{label}</div>
          <div style={{ color: `var(${colorVar})` }} className="text-xl md:text-2xl font-bold">{value}</div>
          {sub && <div style={{ color: "var(--text-dim)" }} className="text-xs mt-1">{sub}</div>}
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="modal-content px-3 py-2 text-sm">
      <p style={{ color: "var(--text-muted)" }} className="text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {typeof p.value === "number" && p.value > 100 ? `฿${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { todayRevenue, todayOrderCount } = useOrders();
  const pastDays = mockDailySales.slice(0, -1);
  const yesterday = pastDays[pastDays.length - 1];
  const weekRevenue = pastDays.reduce((s, d) => s + d.revenue, 0) + todayRevenue;
  const weekOrders = pastDays.reduce((s, d) => s + d.orders, 0) + todayOrderCount;
  const revenueChange = yesterday.revenue > 0 ? (((todayRevenue - yesterday.revenue) / yesterday.revenue) * 100).toFixed(1) : "0";
  const peakHour = mockHourlySales.reduce((a, b) => (a.orders > b.orders ? a : b));
  const avgPerOrder = todayOrderCount > 0 ? Math.round(todayRevenue / todayOrderCount) : 0;

  const dailyChartData = [...pastDays.map((d) => ({ date: d.date.slice(5), revenue: d.revenue, orders: d.orders })), { date: "วันนี้", revenue: todayRevenue, orders: todayOrderCount }];
  const hourlyData = mockHourlySales.map((h) => ({ hour: `${h.hour}:00`, orders: h.orders }));

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 md:gap-6 page-bg">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 style={{ color: "var(--text-primary)" }} className="text-xl md:text-2xl font-bold">รายงานและวิเคราะห์</h1>
          <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm mt-0.5">Analytics &amp; Reports</p>
        </div>
        <button style={{ background: "var(--green-grad)", color: "#fff", boxShadow: "0 2px 12px var(--green-border)" }} className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs md:text-sm transition-all hover:translate-y-[-1px]">⬇ Export</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
        <StatCard icon="💰" label="ยอดขายวันนี้" value={`฿${todayRevenue.toLocaleString()}`} sub={`${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% จากเมื่อวาน`} colorVar="--green" />
        <StatCard icon="📋" label="ออเดอร์วันนี้" value={todayOrderCount} sub={`เฉลี่ย ฿${avgPerOrder}/ออเดอร์`} colorVar="--blue" />
        <StatCard icon="📈" label="ยอดขาย 7 วัน" value={`฿${weekRevenue.toLocaleString()}`} sub={`${weekOrders} ออเดอร์`} colorVar="--yellow" />
        <StatCard icon="⏰" label="ช่วง Peak" value={`${peakHour.hour}:00`} sub={`${peakHour.orders} ออเดอร์`} colorVar="--purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
        <div className="card-glass lg:col-span-2 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📊 ยอดขาย 7 วัน</h2>
            <span style={{ color: "var(--text-dim)" }} className="text-xs">บาท</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyChartData}>
              <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--green)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card-glass p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm">📦 จำนวนออเดอร์</h2>
            <span style={{ color: "var(--text-dim)" }} className="text-xs">7 วัน</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="date" stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="var(--blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
        <div className="card-glass p-4 md:p-5">
          <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm mb-4">🏆 เมนูขายดี Top 5</h2>
          <div className="flex flex-col gap-3">
            {mockTopMenuItems.map((t, i) => {
              const pct = (t.totalQty / mockTopMenuItems[0].totalQty) * 100;
              return (
                <div key={t.menuItem.id} className="flex items-center gap-3">
                  <span style={{ color: i === 0 ? "var(--yellow)" : "var(--text-dim)" }} className="text-sm font-bold w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span style={{ color: "var(--text-primary)" }} className="text-xs font-medium truncate">{t.menuItem.name}</span>
                      <span style={{ color: "var(--text-muted)" }} className="text-xs shrink-0 ml-2">{t.totalQty} จาน</span>
                    </div>
                    <div style={{ background: "var(--border)" }} className="h-1.5 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%`, background: i === 0 ? "var(--yellow-grad)" : "var(--blue-grad)" }} className="h-full rounded-full transition-all" />
                    </div>
                  </div>
                  <span style={{ color: "var(--green)" }} className="text-xs font-semibold shrink-0 w-16 text-right">฿{t.totalRevenue.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card-glass p-4 md:p-5">
          <h2 style={{ color: "var(--text-primary)" }} className="font-semibold text-sm mb-4">⏰ ช่วงเวลาที่ลูกค้าเยอะ</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="hour" stroke="var(--chart-axis)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--chart-axis)" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="var(--purple)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
